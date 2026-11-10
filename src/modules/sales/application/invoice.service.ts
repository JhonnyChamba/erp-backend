import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { InvoiceOrmEntity, InvoiceDetailOrmEntity } from '../infrastructure/persistence/invoice.orm-entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InventoryItemOrmEntity } from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { decryptSecret } from 'src/common/crypto/secret-crypto';
import { buildInvoiceXml } from './sri-xml.builder';
import { loadP12, signXadesBes } from './sri-signer';

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

	private async getNextSequential(manager: EntityManager, companyId: number, establishment: string, emissionPoint: string): Promise<string> {
		const last = await manager.getRepository(InvoiceOrmEntity).findOne({
			where: {
				company: { id: companyId },
				establishment,
				emission_point: emissionPoint,
			},
			order: { id: 'DESC' },
			select: ['id', 'sequential'],
		});

		let nextNum = 1;
		if (last?.sequential) {
			const parsed = parseInt(last.sequential, 10);
			if (!isNaN(parsed)) nextNum = parsed + 1;
		}

		return String(nextNum).padStart(9, '0');
	}

	async create(dto: CreateInvoiceDto, companyId: number, userId?: number) {
		if (!dto.details || dto.details.length === 0) {
			throw new BadRequestException('La factura debe tener al menos un ítem o servicio en el detalle.');
		}

		// Todo en una transacción: numeración, factura y descuento de stock se confirman o se revierten juntos.
		return this.dataSource.transaction((manager) => this.createInTransaction(manager, dto, companyId, userId));
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
		const sequential = await this.getNextSequential(manager, companyId, establishment, emissionPoint);
		const invoiceNumber = `${establishment}-${emissionPoint}-${sequential}`;

		const issueDate = dto.issue_date || new Date().toISOString().slice(0, 10);
		const companyRuc = company.ruc.trim();

		const accessKey = this.generateSRIAccessKey(
			issueDate, companyRuc, establishment, emissionPoint, sequential, company.sri_environment || '1',
		);

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

			const detail = detailRepo.create({
				item_type: d.item_type || 'ITEM',
				item_id: d.item_id,
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

			// Si es un artículo físico del inventario, descontar stock
			if (d.item_type === 'ITEM' && d.item_id) {
				const item = await inventoryItemRepo.findOne({ where: { id: d.item_id, company: { id: companyId } } });
				if (item) {
					item.stock_current = Math.max(0, Number(item.stock_current || 0) - qty);
					await inventoryItemRepo.save(item);
				}
			}
		}

		const total = Number((subtotalTaxable + subtotalZero + taxTotal).toFixed(2));

		const invoice = invoiceRepo.create({
			company: { id: companyId } as any,
			establishment,
			emission_point: emissionPoint,
			branch_id: branch.id,
			branch_address: branch.address,
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
			const itemRepo = manager.getRepository(InventoryItemOrmEntity);
			for (const d of invoice.details || []) {
				if (d.item_type === 'ITEM' && d.item_id) {
					const item = await itemRepo.findOne({ where: { id: d.item_id, company: { id: companyId } } });
					if (item) {
						item.stock_current = Number(item.stock_current || 0) + Number(d.quantity || 0);
						await itemRepo.save(item);
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

