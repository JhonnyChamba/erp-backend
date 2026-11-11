import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { CreditNoteOrmEntity, CreditNoteDetailOrmEntity } from '../infrastructure/persistence/credit-note.orm-entity';
import { InvoiceOrmEntity } from '../infrastructure/persistence/invoice.orm-entity';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import {
	InventoryWarehouseOrmEntity,
	InventoryItemOrmEntity,
} from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
import { InventoryService } from 'src/modules/inventory/application/inventory.service';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { decryptSecret } from 'src/common/crypto/secret-crypto';
import { buildCreditNoteXml } from './sri-xml.builder';
import { loadP12, signXadesBes } from './sri-signer';
import { sleep, sriAuthorization, sriReception, SriEnvironment, SriMessage } from './sri-client';

@Injectable()
export class CreditNoteService {
	constructor(
		@InjectRepository(CreditNoteOrmEntity)
		private readonly creditNoteRepo: Repository<CreditNoteOrmEntity>,
		@InjectRepository(CreditNoteDetailOrmEntity)
		private readonly detailRepo: Repository<CreditNoteDetailOrmEntity>,
		@InjectRepository(InvoiceOrmEntity)
		private readonly invoiceRepo: Repository<InvoiceOrmEntity>,
		@InjectRepository(CompanyOrmEntity)
		private readonly companyRepo: Repository<CompanyOrmEntity>,
		private readonly inventoryService: InventoryService,
		@InjectDataSource()
		private readonly dataSource: DataSource,
	) {}

	/**
	 * Genera la clave de acceso de 49 dígitos según especificación del SRI Ecuador para Notas de Crédito:
	 * FechaEmision(8) + TipoComprobante(2=04) + RUC(13) + TipoAmbiente(1=1pruebas,2=prod) +
	 * Serie(6=Establecimiento3+PuntoEmision3) + Secuencial(9) + CodigoNumerico(8) + TipoEmision(1) + DigitoVerificador(1 Módulo 11)
	 */
	private generateSRIAccessKey(
		issueDate: string,
		ruc: string,
		establishment: string,
		emissionPoint: string,
		sequential: string,
		environment = '1',
	): string {
		const cleanDate = issueDate.replace(/-/g, '');
		const parts = cleanDate.match(/^(\d{4})(\d{2})(\d{2})$/);
		const ddmmyyyy = parts ? `${parts[3]}${parts[2]}${parts[1]}` : cleanDate;

		const docType = '04'; // 04: Nota de Crédito
		const paddedRuc = ruc.padEnd(13, '0').slice(0, 13);
		const serie = `${establishment.padStart(3, '0')}${emissionPoint.padStart(3, '0')}`;
		const seq = sequential.padStart(9, '0');
		const numericCode = String(randomInt(0, 100_000_000)).padStart(8, '0');
		const emissionType = '1';

		const raw48 = `${ddmmyyyy}${docType}${paddedRuc}${environment}${serie}${seq}${numericCode}${emissionType}`;

		// Algoritmo Módulo 11 SRI
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
				  AND s.document_type = 'NOTAS DE CRÉDITO'
				LIMIT 1;
			`, [companyId, branchId, emissionPoint]);

			if (seqRow && seqRow.length > 0) {
				currentCorrelative = Number(seqRow[0].correlative || 0);
			}
		} catch (e) {
			console.error('Error fetching emission sequence for NOTAS DE CRÉDITO:', e);
		}

		const last = await manager.getRepository(CreditNoteOrmEntity).findOne({
			where: {
				company: { id: companyId },
				establishment,
				emission_point: emissionPoint,
			},
			order: { id: 'DESC' },
			select: ['id', 'sequential'],
		});

		let lastNum = 0;
		if (last?.sequential) {
			const parsed = parseInt(last.sequential, 10);
			if (!isNaN(parsed)) lastNum = parsed;
		}

		const nextNum = Math.max(currentCorrelative + 1, lastNum + 1);
		return String(nextNum).padStart(9, '0');
	}

	async create(dto: CreateCreditNoteDto, companyId: number, userId?: number) {
		if (!dto.details || dto.details.length === 0) {
			throw new BadRequestException('La nota de crédito debe contener al menos un ítem o concepto en el detalle.');
		}
		if (!dto.reason || !dto.reason.trim()) {
			throw new BadRequestException('El motivo de emisión de la nota de crédito es obligatorio según el SRI.');
		}

		return this.dataSource.transaction((manager) => this.createInTransaction(manager, dto, companyId, userId));
	}

	private async createInTransaction(manager: EntityManager, dto: CreateCreditNoteDto, companyId: number, userId?: number) {
		const cnRepo = manager.getRepository(CreditNoteOrmEntity);
		const detailRepo = manager.getRepository(CreditNoteDetailOrmEntity);

		// Bloqueo de concurrencia a nivel de empresa
		await manager.query('SELECT id FROM tab_company WHERE id = $1 FOR UPDATE', [companyId]);

		const company = await manager.getRepository(CompanyOrmEntity).findOne({ where: { id: companyId } });
		if (!company) throw new NotFoundException('Empresa no encontrada.');
		if (!company.ruc || !/^[0-9]{13}$/.test(company.ruc.trim())) {
			throw new BadRequestException('La empresa no tiene un RUC válido de 13 dígitos configurado.');
		}

		const branch = await manager.getRepository(BranchCompanyOrmEntity).findOne({
			where: { id: dto.branchId, company: { id: companyId }, deleted: false },
		});
		if (!branch) throw new BadRequestException('La sucursal indicada no existe en esta empresa.');
		if (!branch.enabled) throw new BadRequestException(`La sucursal ${branch.code} - ${branch.name} está deshabilitada.`);

		const establishment = branch.code.padStart(3, '0');
		const emissionPoint = (dto.emission_point || branch.emission_point || '001').padStart(3, '0');

		const sequential = await this.getNextSequential(manager, companyId, branch.id, establishment, emissionPoint);
		const creditNoteNumber = `${establishment}-${emissionPoint}-${sequential}`;

		const issueDate = dto.issue_date || new Date().toISOString().slice(0, 10);
		const accessKey = this.generateSRIAccessKey(
			issueDate, company.ruc.trim(), establishment, emissionPoint, sequential, company.sri_environment || '1',
		);

		// Si se vinculó una factura del sistema, validar y complementar datos
		let originalInvoice: InvoiceOrmEntity | null = null;
		if (dto.invoiceId) {
			originalInvoice = await manager.getRepository(InvoiceOrmEntity).findOne({
				where: { id: dto.invoiceId, company: { id: companyId } },
			});
			if (!originalInvoice) {
				throw new NotFoundException(`La factura ID ${dto.invoiceId} no existe en esta empresa.`);
			}
		}

		const customerIdType = dto.customer_id_type || originalInvoice?.customer_id_type || '05';
		const customerIdNumber = (dto.customer_id_number || originalInvoice?.customer_id_number || '').trim();
		const customerName = (dto.customer_name || originalInvoice?.customer_name || '').trim();
		const customerAddress = (dto.customer_address || originalInvoice?.customer_address || '').trim();
		const customerEmail = (dto.customer_email || originalInvoice?.customer_email || '').trim();
		const customerPhone = (dto.customer_phone || originalInvoice?.customer_phone || '').trim();

		const modifiedDocNumber = dto.modified_document_number || originalInvoice?.invoice_number || '';
		const modifiedDocDate = dto.modified_document_date || originalInvoice?.issue_date || issueDate;

		if (!modifiedDocNumber) {
			throw new BadRequestException('Debe especificar el número de la factura modificada.');
		}

		// Resolver bodega por defecto
		let defaultWarehouseId: number | null = originalInvoice?.warehouse_id || null;
		if (!defaultWarehouseId) {
			const activeWhs = await manager.getRepository(InventoryWarehouseOrmEntity).find({
				where: { company: { id: companyId }, deleted: false, enabled: true },
				order: { is_default: 'DESC', id: 'ASC' },
			});
			if (activeWhs.length > 0) {
				defaultWarehouseId = activeWhs[0].id;
			}
		}

		let subtotalZero = 0;
		let subtotalTaxable = 0;
		let discountTotal = 0;
		let taxTotal = 0;

		const detailEntities: CreditNoteDetailOrmEntity[] = [];
		const shouldAdjustInventory = dto.adjust_inventory !== false;

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

			discountTotal += discount;
			taxTotal += rowTax;

			const detailWarehouseId = d.warehouse_id || defaultWarehouseId;

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

			// Reingreso de mercadería física devuelta a bodega si aplica
			const isPhysical = d.item_type === 'PRODUCT' || d.item_type === 'ITEM';
			if (shouldAdjustInventory && isPhysical && d.item_id && detailWarehouseId) {
				await this.inventoryService.registerEntry(
					{
						companyId,
						warehouseId: detailWarehouseId,
						productId: d.item_id,
						quantity: qty,
						movementReason: 'CUSTOMER_RETURN',
						collectionOriginName: 'CREDIT_NOTE',
						collectionOriginDocument: creditNoteNumber,
						createdUserId: userId,
					},
					manager,
				);
			}
		}

		const total = Number((subtotalTaxable + subtotalZero + taxTotal).toFixed(2));

		const creditNote = cnRepo.create({
			company: { id: companyId } as any,
			invoice: originalInvoice ? ({ id: originalInvoice.id } as any) : null,
			branch_id: branch.id,
			branch_address: branch.address,
			establishment,
			emission_point: emissionPoint,
			sequential,
			credit_note_number: creditNoteNumber,
			issue_date: issueDate,
			modified_document_type: dto.modified_document_type || '01',
			modified_document_number: modifiedDocNumber,
			modified_document_date: modifiedDocDate,
			reason: dto.reason.trim(),
			customer_id_type: customerIdType,
			customer_id_number: customerIdNumber,
			customer_name: customerName,
			customer_address: customerAddress,
			customer_email: customerEmail,
			customer_phone: customerPhone,
			access_key: accessKey,
			status: 'ISSUED',
			subtotal_zero_tax: Number(subtotalZero.toFixed(2)),
			subtotal_taxable: Number(subtotalTaxable.toFixed(2)),
			subtotal: Number((subtotalZero + subtotalTaxable).toFixed(2)),
			discount_total: Number(discountTotal.toFixed(2)),
			tax_total: Number(taxTotal.toFixed(2)),
			total,
			adjust_inventory: shouldAdjustInventory,
			notes: dto.notes || '',
			created_by: userId,
			enabled: true,
			deleted: false,
			details: detailEntities,
		});

		const saved = await cnRepo.save(creditNote);

		// Actualizar correlativo de NOTAS DE CRÉDITO en el punto de emisión
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
					  AND s.document_type = 'NOTAS DE CRÉDITO'
					  AND s.correlative < $1;
				`, [numericSeq, companyId, branch.id, emissionPoint]);
			}
		} catch (seqErr) {
			console.error('Error actualizando correlativo de NOTAS DE CRÉDITO:', seqErr);
		}

		return saved;
	}

	async list(companyId: number, options?: { branchId?: number; invoiceId?: number; search?: string }) {
		const qb = this.creditNoteRepo
			.createQueryBuilder('cn')
			.leftJoinAndSelect('cn.details', 'details')
			.leftJoinAndSelect('cn.invoice', 'invoice')
			.where('cn.company_id = :companyId', { companyId })
			.andWhere('cn.deleted = false')
			.orderBy('cn.id', 'DESC');

		if (options?.branchId) {
			qb.andWhere('cn.branch_id = :branchId', { branchId: options.branchId });
		}
		if (options?.invoiceId) {
			qb.andWhere('cn.invoice_id = :invoiceId', { invoiceId: options.invoiceId });
		}
		if (options?.search) {
			qb.andWhere(
				'(cn.credit_note_number ILIKE :s OR cn.customer_name ILIKE :s OR cn.customer_id_number ILIKE :s OR cn.modified_document_number ILIKE :s)',
				{ s: `%${options.search}%` },
			);
		}

		return qb.getMany();
	}

	async findById(id: number, companyId: number) {
		const cn = await this.creditNoteRepo.findOne({
			where: { id, company: { id: companyId }, deleted: false },
			relations: ['details', 'invoice', 'company'],
		});
		if (!cn) throw new NotFoundException('Nota de crédito no encontrada.');
		return cn;
	}

	async getNextSequentialPreview(companyId: number, branchId: number, emissionPoint: string) {
		return this.getNextSequential(this.creditNoteRepo.manager, companyId, branchId, '001', emissionPoint);
	}

	/**
	 * Firma y envía la Nota de Crédito al SRI (Recepción y Autorización)
	 */
	async sendToSri(id: number, companyId: number) {
		const cn = await this.findById(id, companyId);
		const company = await this.companyRepo
			.createQueryBuilder('c')
			.addSelect(['c.cert_p12_base64', 'c.cert_password_enc'])
			.where('c.id = :companyId', { companyId })
			.getOne();
		if (!company) throw new NotFoundException('Empresa no encontrada.');

		if (cn.sri_status === 'AUTHORIZED') {
			return {
				success: true,
				status: 'AUTHORIZED',
				message: 'Esta nota de crédito ya está autorizada por el SRI.',
				authorizationNumber: cn.sri_authorization_number,
				authorizationDate: cn.sri_authorization_date,
			};
		}

		// 1. Obtener o generar XML firmado
		let signedXml: string;
		if (cn.sign_status === 'SIGNED' && cn.signed_xml) {
			signedXml = cn.signed_xml;
		} else {
			if (!company.cert_p12_base64 || !company.cert_password_enc) {
				throw new BadRequestException('La empresa no tiene configurada la firma electrónica (.p12) en Configuración > Empresas.');
			}
			const parsedP12 = loadP12(company.cert_p12_base64, decryptSecret(company.cert_password_enc));
			if (parsedP12.notAfter.getTime() < Date.now()) {
				throw new BadRequestException(`La firma electrónica caducó el ${parsedP12.notAfter.toISOString().slice(0, 10)}.`);
			}

			const canonicalXml = buildCreditNoteXml(cn, company);
			signedXml = signXadesBes(canonicalXml, parsedP12);

			cn.signed_xml = signedXml;
			cn.signed_at = new Date();
			cn.sign_status = 'SIGNED';
			await this.creditNoteRepo.save(cn);
		}

		// 2. Recepción SRI
		const env = (company.sri_environment || '1') as SriEnvironment;
		const receptionRes = await sriReception(signedXml, env);
		cn.sri_sent_at = new Date();

		if (receptionRes.estado !== 'RECIBIDA') {
			cn.sri_status = 'RETURNED';
			cn.sri_messages = receptionRes.mensajes || [];
			cn.sri_response_xml = receptionRes.rawXml || null;
			await this.creditNoteRepo.save(cn);
			return {
				success: false,
				status: 'RETURNED',
				message: 'El SRI devolvió la nota de crédito por inconsistencias.',
				sriMessages: cn.sri_messages,
			};
		}

		// 3. Autorización SRI con reintentos
		await sleep(2000);
		let authResult = await sriAuthorization(cn.access_key, env);
		for (let retry = 0; retry < 3 && authResult.estado === 'EN PROCESO'; retry++) {
			await sleep(2000);
			authResult = await sriAuthorization(cn.access_key, env);
		}

		cn.sri_response_xml = authResult.rawXml || null;
		cn.sri_messages = authResult.mensajes;

		if (authResult.estado === 'AUTORIZADO') {
			cn.sri_status = 'AUTHORIZED';
			cn.status = 'AUTHORIZED';
			cn.sri_authorization_number = authResult.numeroAutorizacion || cn.access_key;
			cn.sri_authorization_date = authResult.fechaAutorizacion ? new Date(authResult.fechaAutorizacion) : new Date();
			await this.creditNoteRepo.save(cn);

			return {
				success: true,
				status: 'AUTHORIZED',
				message: 'Nota de crédito AUTORIZADA correctamente por el SRI.',
				authorizationNumber: cn.sri_authorization_number,
				authorizationDate: cn.sri_authorization_date,
			};
		}

		if (authResult.estado === 'NO AUTORIZADO') {
			cn.sri_status = 'NOT_AUTHORIZED';
			await this.creditNoteRepo.save(cn);
			return {
				success: false,
				status: 'NOT_AUTHORIZED',
				message: 'La nota de crédito NO fue autorizada por el SRI.',
				sriMessages: cn.sri_messages,
			};
		}

		cn.sri_status = 'IN_PROCESS';
		await this.creditNoteRepo.save(cn);
		return {
			success: true,
			status: 'IN_PROCESS',
			message: 'La nota de crédito fue RECIBIDA por el SRI y se encuentra en procesamiento.',
		};
	}

	async getSignedXml(id: number, companyId: number): Promise<string> {
		const cn = await this.creditNoteRepo
			.createQueryBuilder('cn')
			.addSelect('cn.signed_xml')
			.where('cn.id = :id AND cn.company_id = :companyId AND cn.deleted = false', { id, companyId })
			.getOne();

		if (!cn || !cn.signed_xml) {
			throw new NotFoundException('La nota de crédito no tiene un XML firmado disponible.');
		}
		return cn.signed_xml;
	}
}
