import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { InvoiceOrmEntity, InvoiceDetailOrmEntity } from '../infrastructure/persistence/invoice.orm-entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import {
	InventoryItemOrmEntity,
	InventoryWarehouseOrmEntity,
} from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
import { InventoryService } from 'src/modules/inventory/application/inventory.service';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { decryptSecret } from 'src/common/crypto/secret-crypto';
import { buildInvoiceXml } from './sri-xml.builder';
import { loadP12, signXadesBes } from './sri-signer';
import { sleep, sriAuthorization, sriReception, SriEnvironment, SriMessage } from './sri-client';

@Injectable()
export class InvoiceService {
	constructor(
		@InjectRepository(InvoiceOrmEntity)
		private readonly invoiceRepo: Repository<InvoiceOrmEntity>,
		@InjectRepository(InvoiceDetailOrmEntity)
		private readonly detailRepo: Repository<InvoiceDetailOrmEntity>,
		@InjectRepository(InventoryItemOrmEntity)
		private readonly inventoryItemRepo: Repository<InventoryItemOrmEntity>,
		@InjectRepository(CompanyOrmEntity)
		private readonly companyRepo: Repository<CompanyOrmEntity>,
		private readonly inventoryService: InventoryService,
		@InjectDataSource()
		private readonly dataSource: DataSource,
	) {}

	/**
	 * Genera la clave de acceso de 49 dígitos según especificación del SRI Ecuador:
	 * FechaEmision(8) + TipoComprobante(2=01) + RUC(13) + TipoAmbiente(1=1pruebas,2=prod) +
	 * Serie(6=Establecimiento3+PuntoEmision3) + Secuencial(9) + CodigoNumerico(8) + TipoEmision(1) + DigitoVerificador(1 Módulo 11)
	 */
	private generateSRIAccessKey(
		issueDate: string, // YYYY-MM-DD
		ruc: string,
		establishment: string,
		emissionPoint: string,
		sequential: string,
		environment = '1', // 1: Pruebas, 2: Producción
	): string {
		const cleanDate = issueDate.replace(/-/g, ''); // YYYYMMDD -> DDMMYYYY
		const parts = cleanDate.match(/^(\d{4})(\d{2})(\d{2})$/);
		const ddmmyyyy = parts ? `${parts[3]}${parts[2]}${parts[1]}` : cleanDate;

		const docType = '01'; // 01: Factura
		const paddedRuc = ruc.padEnd(13, '0').slice(0, 13);
		const serie = `${establishment.padStart(3, '0')}${emissionPoint.padStart(3, '0')}`;
		const seq = sequential.padStart(9, '0');
		// Código numérico de 8 dígitos aleatorio (campo de seguridad de la clave de acceso, ficha técnica SRI)
		const numericCode = String(randomInt(0, 100_000_000)).padStart(8, '0');
		const emissionType = '1'; // Normal

		const raw48 = `${ddmmyyyy}${docType}${paddedRuc}${environment}${serie}${seq}${numericCode}${emissionType}`;

		// Módulo 11
		let factor = 2;
		let sum = 0;
		for (let i = raw48.length - 1; i >= 0; i--) {
			sum += parseInt(raw48[i], 10) * factor;
			factor = factor === 7 ? 2 : factor + 1;
		}
		const mod11 = 11 - (sum % 11);
		let verifier = String(mod11);
		if (mod11 === 11) verifier = '0';
		else if (mod11 === 10) verifier = '1';

		return `${raw48}${verifier}`;
	}

	private async getNextSequential(
		manager: EntityManager,
		companyId: number,
		branchId: number,
		establishment: string,
		emissionPoint: string,
	): Promise<string> {
		let currentCorrelative = 0;
		try {
			const seqRow = await manager.query(`
				SELECT s.id, s.correlative
				FROM tab_emission_point_sequence s
				JOIN tab_emission_point p ON p.id = s.emission_point_id
				WHERE p.company_id = $1 
				  AND p.branch_id = $2
				  AND p.serie = $3
				  AND s.document_type = 'FACTURAS'
				LIMIT 1;
			`, [companyId, branchId, emissionPoint]);

			if (seqRow && seqRow.length > 0) {
				currentCorrelative = Number(seqRow[0].correlative || 0);
			}
		} catch (e) {
			console.error('Error fetching emission sequence:', e);
		}

		const last = await manager.getRepository(InvoiceOrmEntity).findOne({
			where: {
				company: { id: companyId },
				establishment,
				emission_point: emissionPoint,
			},
			order: { id: 'DESC' },
			select: ['id', 'sequential'],
		});

		let lastInvoiceNum = 0;
		if (last?.sequential) {
			const parsed = parseInt(last.sequential, 10);
			if (!isNaN(parsed)) lastInvoiceNum = parsed;
		}

		const nextNum = Math.max(currentCorrelative + 1, lastInvoiceNum + 1);
		return String(nextNum).padStart(9, '0');
	}

	async create(dto: CreateInvoiceDto, companyId: number, userId?: number) {
		if (!dto.details || dto.details.length === 0) {
			throw new BadRequestException('La factura debe tener al menos un ítem o servicio en el detalle.');
		}

		// Todo en una transacción: numeración, factura y descuento de stock se confirman o se revierten juntos.
		const saved = await this.dataSource.transaction((manager) => this.createInTransaction(manager, dto, companyId, userId));

		// Si la empresa tiene habilitado el envío automático al SRI, firmar y enviar de inmediato
		try {
			const company = await this.companyRepo.findOne({ where: { id: companyId }, select: ['id', 'auto_send_sri'] });
			if (company?.auto_send_sri) {
				try {
					const sriResult = await this.sendToSri(saved.id, companyId);
					return {
						...saved,
						sri_result: sriResult,
					};
				} catch (err: any) {
					const errorMsg = err?.message || 'Error inesperado al enviar comprobante al SRI.';
					const fallbackMessages = [{ identificador: 'ERR-ENVIO', mensaje: errorMsg, tipo: 'ERROR' }];
					await this.invoiceRepo.update(
						{ id: saved.id },
						{ sri_status: 'RETURNED', sri_messages: fallbackMessages },
					);
					return {
						...saved,
						sri_result: {
							id: saved.id,
							success: false,
							status: 'RETURNED',
							sri_status: 'RETURNED',
							sri_authorization_number: null,
							sri_authorization_date: null,
							sri_messages: fallbackMessages,
							error: errorMsg,
						},
					};
				}
			}
		} catch (compErr) {
			console.error('Error verificando envío automático al SRI:', compErr);
		}

		return saved;
	}

	private async createInTransaction(manager: EntityManager, dto: CreateInvoiceDto, companyId: number, userId?: number) {
		const invoiceRepo = manager.getRepository(InvoiceOrmEntity);
		const detailRepo = manager.getRepository(InvoiceDetailOrmEntity);
		const inventoryItemRepo = manager.getRepository(InventoryItemOrmEntity);

		// Bloquea la fila de la empresa: serializa la emisión de facturas de una misma empresa (evita secuenciales repetidos).
		await manager.query('SELECT id FROM tab_company WHERE id = $1 FOR UPDATE', [companyId]);

		// Obtener datos de la empresa emisora (RUC, ambiente y serie por defecto)
		const company = await manager.getRepository(CompanyOrmEntity).findOne({ where: { id: companyId } });
		if (!company) throw new NotFoundException('Empresa no encontrada.');
		if (!company.ruc || !/^[0-9]{13}$/.test(company.ruc.trim())) {
			throw new BadRequestException('La empresa emisora no tiene un RUC válido de 13 dígitos. Configúralo antes de facturar.');
		}
		// Toda factura pertenece a una empresa y a una sucursal: la sucursal define el establecimiento, el punto de emisión
		// por defecto y la dirección del establecimiento que se envía al SRI.
		const branch = await manager.getRepository(BranchCompanyOrmEntity).findOne({ where: { id: dto.branchId, company: { id: companyId }, deleted: false } });
		if (!branch) throw new BadRequestException('La sucursal indicada no existe en esta empresa.');
		if (!branch.enabled) throw new BadRequestException(`La sucursal ${branch.code} - ${branch.name} está deshabilitada.`);
		const establishment = branch.code.padStart(3, '0');
		const emissionPoint = (dto.emission_point || branch.emission_point || '001').padStart(3, '0');
		if (!/^[0-9]{3}$/.test(establishment) || !/^[0-9]{3}$/.test(emissionPoint)) {
			throw new BadRequestException('El establecimiento y el punto de emisión deben tener 3 dígitos (corrige el código de la sucursal).');
		}
		const sequential = await this.getNextSequential(manager, companyId, branch.id, establishment, emissionPoint);
		const invoiceNumber = `${establishment}-${emissionPoint}-${sequential}`;

		const issueDate = dto.issue_date || new Date().toISOString().slice(0, 10);
		const companyRuc = company.ruc.trim();

		const accessKey = this.generateSRIAccessKey(
			issueDate, companyRuc, establishment, emissionPoint, sequential, company.sri_environment || '1',
		);

		// Resolver bodega predeterminada de despacho para la factura
		let headerWarehouseId = dto.warehouse_id ?? dto.warehouseId;
		if (!headerWarehouseId) {
			const activeWhs = await manager.getRepository(InventoryWarehouseOrmEntity).find({
				where: { company: { id: companyId }, deleted: false, enabled: true },
				order: { is_default: 'DESC', id: 'ASC' },
			});
			if (activeWhs.length > 0) {
				headerWarehouseId = activeWhs[0].id;
			}
		}

		// Calcular totales conforme al SRI
		let subtotalZero = 0;
		let subtotalTaxable = 0;
		let subtotalGross = 0;
		let discountTotal = 0;
		let taxTotal = 0;

		const detailEntities: InvoiceDetailOrmEntity[] = [];

		for (const d of dto.details) {
			const qty = Number(d.quantity || 1);
			const unitPrice = Number(d.unit_price || 0);
			const discount = Number(d.discount || 0);
			const taxRate = Number(d.tax_rate ?? 15);

			const rowSubtotal = Math.max(0, qty * unitPrice - discount);
			const rowTax = Number(((rowSubtotal * taxRate) / 100).toFixed(2));
			const rowTotal = Number((rowSubtotal + rowTax).toFixed(2));

			if (taxRate > 0) {
				subtotalTaxable += rowSubtotal;
			} else {
				subtotalZero += rowSubtotal;
			}

			subtotalGross += qty * unitPrice;
			discountTotal += discount;
			taxTotal += rowTax;

			const detailWarehouseId = d.warehouse_id ?? d.warehouseId ?? headerWarehouseId;

			const detail = detailRepo.create({
				item_type: d.item_type || 'PRODUCT',
				item_id: d.item_id,
				warehouse_id: detailWarehouseId || null,
				code: d.code || '',
				description: d.description,
				quantity: qty,
				unit_price: unitPrice,
				discount,
				tax_rate: taxRate,
				tax_value: rowTax,
				subtotal: rowSubtotal,
				total: rowTotal,
			});
			detailEntities.push(detail);

			// Si es un artículo físico (PRODUCT o ITEM), registrar la salida con InventoryService
			const isPhysical = d.item_type === 'PRODUCT' || d.item_type === 'ITEM';
			if (isPhysical && d.item_id) {
				if (!detailWarehouseId) {
					throw new BadRequestException(
						`El producto "${d.description}" requiere una bodega de despacho asignada para controlar inventario.`,
					);
				}
				await this.inventoryService.registerExit(
					{
						companyId,
						warehouseId: detailWarehouseId,
						productId: d.item_id,
						quantity: qty,
						movementReason: 'SALE',
						collectionOriginName: 'INVOICE',
						collectionOriginDocument: invoiceNumber,
						createdUserId: userId,
					},
					manager,
				);
			}
		}

		const total = Number((subtotalTaxable + subtotalZero + taxTotal).toFixed(2));

		const invoice = invoiceRepo.create({
			company: { id: companyId } as any,
			establishment,
			emission_point: emissionPoint,
			branch_id: branch.id,
			branch_address: branch.address,
			logo_url: branch.logo_url || company.logo_url || null,
			warehouse_id: headerWarehouseId || null,
			sequential,
			invoice_number: invoiceNumber,
			issue_date: issueDate,
			customer_id_type: dto.customer_id_type || '05',
			customer_id_number: dto.customer_id_number.trim(),
			customer_name: dto.customer_name.trim(),
			customer_address: dto.customer_address?.trim() || '',
			customer_email: dto.customer_email?.trim() || '',
			customer_phone: dto.customer_phone?.trim() || '',
			payment_method: dto.payment_method || '01',
			access_key: accessKey,
			status: 'ISSUED',
			subtotal_zero_tax: Number(subtotalZero.toFixed(2)),
			subtotal_taxable: Number(subtotalTaxable.toFixed(2)),
			subtotal: Number((subtotalZero + subtotalTaxable).toFixed(2)),
			discount_total: Number(discountTotal.toFixed(2)),
			tax_total: Number(taxTotal.toFixed(2)),
			total,
			notes: dto.notes || '',
			created_by: userId,
			enabled: true,
			deleted: false,
			details: detailEntities,
		});

		const saved = await invoiceRepo.save(invoice);

		// Actualizar el nuevo correlativo en el detalle de la secuencia del punto de emisión para FACTURAS
		try {
			const numericSeq = parseInt(sequential, 10);
			if (!isNaN(numericSeq)) {
				await manager.query(`
					UPDATE tab_emission_point_sequence s
					SET correlative = $1, updated_at = NOW()
					FROM tab_emission_point p
					WHERE s.emission_point_id = p.id
					  AND p.company_id = $2
					  AND p.branch_id = $3
					  AND p.serie = $4
					  AND s.document_type = 'FACTURAS'
					  AND s.correlative < $1;
				`, [numericSeq, companyId, branch.id, emissionPoint]);
			}
		} catch (err) {
			console.error('Error al actualizar correlativo en tab_emission_point_sequence:', err);
		}

		return saved;
	}

	/** Facturas de la empresa; si se indica branchId, solo las de esa sucursal. */
	async findAll(companyId: number, branchId?: number) {
		return this.invoiceRepo.find({
			where: { company: { id: companyId }, deleted: false, ...(branchId ? { branch_id: branchId } : {}) },
			relations: ['details'],
			order: { id: 'DESC' },
		});
	}

	async findOne(id: number, companyId: number) {
		const invoice = await this.invoiceRepo.findOne({
			where: { id, company: { id: companyId }, deleted: false },
			relations: ['details'],
		});
		if (!invoice) throw new NotFoundException('Factura no encontrada.');
		return invoice;
	}

	async cancel(id: number, companyId: number) {
		const invoice = await this.findOne(id, companyId);
		if (invoice.status === 'CANCELED') return invoice;

		// Al anular se devuelve al inventario el stock que descontó la factura (en una sola transacción).
		return this.dataSource.transaction(async (manager) => {
			for (const d of invoice.details || []) {
				const isPhysical = d.item_type === 'PRODUCT' || d.item_type === 'ITEM';
				const warehouseId = d.warehouse_id || invoice.warehouse_id;
				if (isPhysical && d.item_id && warehouseId) {
					try {
						await this.inventoryService.registerEntry(
							{
								companyId,
								warehouseId,
								productId: d.item_id,
								quantity: Number(d.quantity || 1),
								movementReason: 'CUSTOMER_RETURN',
								collectionOriginName: 'INVOICE_CANCEL',
								collectionOriginDocument: `Anulación de factura ${invoice.invoice_number}`,
							},
							manager,
						);
					} catch (e) {
						// Si el artículo no existe en inventario o fue eliminado, continuar
					}
				}
			}
			invoice.status = 'CANCELED';
			return manager.getRepository(InvoiceOrmEntity).save(invoice);
		});
	}

	/** Genera el XML del SRI, lo firma con el .p12 de la empresa y lo guarda. */
	async sign(id: number, companyId: number) {
		const invoice = await this.findOne(id, companyId);
		if (invoice.status === 'CANCELED') {
			throw new BadRequestException('No se puede firmar una factura anulada.');
		}

		const company = await this.companyRepo
			.createQueryBuilder('c')
			.addSelect(['c.cert_p12_base64', 'c.cert_password_enc'])
			.where('c.id = :companyId', { companyId })
			.getOne();
		if (!company) throw new NotFoundException('Empresa no encontrada.');
		if (!company.cert_p12_base64 || !company.cert_password_enc) {
			throw new BadRequestException(
				'La empresa no tiene firma electrónica. Cárgala en Configuración > Empresas > Firma electrónica.',
			);
		}

		try {
			const xml = buildInvoiceXml(invoice, company);
			const loaded = loadP12(company.cert_p12_base64, decryptSecret(company.cert_password_enc));
			if (loaded.notAfter.getTime() < Date.now()) {
				throw new Error(`La firma electrónica caducó el ${loaded.notAfter.toISOString().slice(0, 10)}.`);
			}
			const signed = signXadesBes(xml, loaded);

			await this.invoiceRepo.update(
				{ id },
				{ signed_xml: signed, signed_at: new Date(), sign_status: 'SIGNED' },
			);
			return { id, sign_status: 'SIGNED', file_name: `${invoice.access_key}.xml` };
		} catch (e: any) {
			throw new BadRequestException(e?.message || 'No se pudo firmar la factura.');
		}
	}

	/**
	 * Envía el XML firmado al SRI (recepción) y, si fue recibido, consulta la autorización.
	 * Guarda en la factura el estado, el número/fecha de autorización y los mensajes de rechazo.
	 */
	async sendToSri(id: number, companyId: number) {
		let invoice = await this.invoiceRepo
			.createQueryBuilder('i')
			.addSelect('i.signed_xml')
			.where('i.id = :id AND i.company_id = :companyId AND i.deleted = false', { id, companyId })
			.getOne();
		if (!invoice) throw new NotFoundException('Factura no encontrada.');
		if (invoice.status === 'CANCELED') throw new BadRequestException('No se puede enviar al SRI una factura anulada.');
		if (invoice.sri_status === 'AUTHORIZED') {
			return this.buildSriResult(
				id,
				'AUTHORIZED',
				invoice.sri_messages || [],
				invoice.sri_authorization_number,
				invoice.sri_authorization_date ? invoice.sri_authorization_date.toISOString() : undefined,
			);
		}

		if (invoice.sign_status !== 'SIGNED' || !invoice.signed_xml) {
			await this.sign(id, companyId);
			invoice = await this.invoiceRepo
				.createQueryBuilder('i')
				.addSelect('i.signed_xml')
				.where('i.id = :id AND i.company_id = :companyId AND i.deleted = false', { id, companyId })
				.getOne();
			if (!invoice) throw new NotFoundException('Factura no encontrada tras firmar.');
		}

		const environment = await this.getSriEnvironment(companyId);

		let reception;
		try {
			reception = await sriReception(invoice.signed_xml, environment);
		} catch (e: any) {
			throw new BadRequestException(e?.message || 'No se pudo enviar la factura al SRI.');
		}

		const sentAt = new Date();
		if (reception.estado !== 'RECIBIDA') {
			// DEVUELTA: el SRI rechazó el comprobante en recepción (estructura, firma, clave de acceso, etc.).
			await this.invoiceRepo.update(
				{ id },
				{ sri_status: 'RETURNED', sri_sent_at: sentAt, sri_messages: reception.mensajes, sri_response_xml: reception.rawXml },
			);
			return this.buildSriResult(id, 'RETURNED', reception.mensajes);
		}

		// Recibida: el SRI procesa de forma asíncrona; se espera un momento antes de consultar la autorización.
		await this.invoiceRepo.update({ id }, { sri_status: 'IN_PROCESS', sri_sent_at: sentAt, sri_messages: reception.mensajes, sri_response_xml: reception.rawXml });
		await sleep(3000);
		return this.checkSriAuthorization(id, companyId);
	}

	/** Consulta al SRI la autorización de una factura ya enviada y actualiza su estado. */
	async checkSriAuthorization(id: number, companyId: number) {
		const invoice = await this.findOne(id, companyId);
		if (!invoice.access_key) throw new BadRequestException('La factura no tiene clave de acceso.');
		if (invoice.sri_status === 'NOT_SENT' || invoice.sri_status === 'RETURNED') {
			throw new BadRequestException('La factura aún no ha sido recibida por el SRI. Envíala primero.');
		}

		const environment = await this.getSriEnvironment(companyId);

		let authorization;
		try {
			authorization = await sriAuthorization(invoice.access_key, environment);
		} catch (e: any) {
			throw new BadRequestException(e?.message || 'No se pudo consultar la autorización en el SRI.');
		}

		if (authorization.estado === 'AUTORIZADO') {
			await this.invoiceRepo.update(
				{ id },
				{
					sri_status: 'AUTHORIZED',
					status: 'AUTHORIZED',
					sri_authorization_number: authorization.numeroAutorizacion ?? invoice.access_key,
					sri_authorization_date: authorization.fechaAutorizacion ? new Date(authorization.fechaAutorizacion) : new Date(),
					sri_messages: authorization.mensajes,
					sri_response_xml: authorization.rawXml,
				},
			);
			return this.buildSriResult(id, 'AUTHORIZED', authorization.mensajes, authorization.numeroAutorizacion ?? invoice.access_key, authorization.fechaAutorizacion);
		}

		if (authorization.estado === 'NO AUTORIZADO') {
			await this.invoiceRepo.update(
				{ id },
				{ sri_status: 'NOT_AUTHORIZED', sri_messages: authorization.mensajes, sri_response_xml: authorization.rawXml },
			);
			return this.buildSriResult(id, 'NOT_AUTHORIZED', authorization.mensajes);
		}

		// EN PROCESO: el SRI todavía no respondió; el usuario puede volver a consultar más tarde.
		await this.invoiceRepo.update({ id }, { sri_status: 'IN_PROCESS', sri_response_xml: authorization.rawXml });
		return this.buildSriResult(id, 'IN_PROCESS', authorization.mensajes);
	}

	private async getSriEnvironment(companyId: number): Promise<SriEnvironment> {
		const company = await this.companyRepo.findOne({ where: { id: companyId }, select: ['id', 'sri_environment'] });
		if (!company) throw new NotFoundException('Empresa no encontrada.');
		return company.sri_environment === '2' ? '2' : '1';
	}

	private buildSriResult(id: number, sri_status: string, messages: SriMessage[], authorizationNumber?: string, authorizationDate?: string) {
		return {
			id,
			success: sri_status === 'AUTHORIZED',
			status: sri_status,
			sri_status,
			sri_authorization_number: authorizationNumber ?? null,
			sri_authorization_date: authorizationDate ?? null,
			sri_messages: messages || [],
		};
	}

	async getSignedXml(id: number, companyId: number) {
		const invoice = await this.invoiceRepo
			.createQueryBuilder('i')
			.addSelect('i.signed_xml')
			.where('i.id = :id AND i.company_id = :companyId AND i.deleted = false', { id, companyId })
			.getOne();
		if (!invoice) throw new NotFoundException('Factura no encontrada.');
		if (!invoice.signed_xml) throw new BadRequestException('La factura aún no está firmada.');
		return { file_name: `${invoice.access_key}.xml`, xml: invoice.signed_xml };
	}
}

