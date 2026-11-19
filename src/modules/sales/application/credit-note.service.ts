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
import { buildCreditNoteXml, isSupportedIvaRate, todayInEcuador } from './sri-xml.builder';
import { loadP12, signXadesBes } from './sri-signer';
import { sleep, sriAuthorization, sriReception, SriEnvironment, SriMessage } from './sri-client';

// Nombre del tipo de documento en tab_emission_point_sequence (el mismo que usa EmissionPointService).
const CREDIT_NOTE_SEQUENCE_TYPE = 'NOTAS DE CRÉDITO';

/** Clave para relacionar una línea de nota de crédito con las líneas de la factura que modifica. */
const lineKey = (d: { item_type?: string | null; item_id?: number | null; code?: string | null; description?: string | null }): string =>
	d.item_id
		? `ID:${d.item_type || 'PRODUCT'}:${d.item_id}`
		: `TXT:${(d.code || '').trim().toUpperCase()}|${(d.description || '').trim().toUpperCase()}`;

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
		// Sin try/catch: dentro de una transacción un error de consulta la deja abortada y debe propagarse.
		const seqRow = await manager.query(`
			SELECT s.id, s.correlative
			FROM tab_emission_point_sequence s
			JOIN tab_emission_point p ON p.id = s.emission_point_id
			WHERE p.company_id = $1
			  AND p.branch_id = $2
			  AND p.serie = $3
			  AND s.document_type = $4
			ORDER BY s.correlative DESC
			LIMIT 1;
		`, [companyId, branchId, emissionPoint, CREDIT_NOTE_SEQUENCE_TYPE]);

		if (seqRow && seqRow.length > 0) {
			currentCorrelative = Number(seqRow[0].correlative || 0);
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

		const nextNum = Math.max(currentCorrelative, lastNum) + 1;
		return String(nextNum).padStart(9, '0');
	}

	async create(dto: CreateCreditNoteDto, companyId: number, userId?: number) {
		if (!dto.details || dto.details.length === 0) {
			throw new BadRequestException('La nota de crédito debe contener al menos un ítem o concepto en el detalle.');
		}
		if (!dto.reason || !dto.reason.trim()) {
			throw new BadRequestException('El motivo de emisión de la nota de crédito es obligatorio según el SRI.');
		}

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
					const errorMsg = err?.message || 'Error inesperado al enviar la nota de crédito al SRI.';
					const fallbackMessages = [{ identificador: 'ERR-ENVIO', mensaje: errorMsg, tipo: 'ERROR' }];
					// Si la recepción ya respondió RECIBIDA (o el SRI ya resolvió), ese estado no se pisa con RETURNED.
					const current = await this.creditNoteRepo.findOne({ where: { id: saved.id }, select: ['id', 'sri_status', 'sri_messages'] });
					const currentStatus = current?.sri_status || 'NOT_SENT';
					if (currentStatus === 'IN_PROCESS' || currentStatus === 'AUTHORIZED' || currentStatus === 'NOT_AUTHORIZED') {
						return {
							...saved,
							sri_result: {
								...this.buildSriResult(saved.id, currentStatus, errorMsg, current?.sri_messages || []),
								error: errorMsg,
							},
						};
					}
					await this.creditNoteRepo.update(
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
							message: errorMsg,
							sri_authorization_number: null,
							authorizationNumber: null,
							sri_authorization_date: null,
							authorizationDate: null,
							sri_messages: fallbackMessages,
							sriMessages: fallbackMessages,
							error: errorMsg,
						},
					};
				}
			}
		} catch (compErr) {
			console.error('Error verificando envío automático al SRI en nota de crédito:', compErr);
		}

		return saved;
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

		const issueDate = dto.issue_date || todayInEcuador();
		const accessKey = this.generateSRIAccessKey(
			issueDate, company.ruc.trim(), establishment, emissionPoint, sequential, company.sri_environment || '1',
		);

		// Si se vinculó una factura del sistema (por ID o por su número), se bloquea, se valida y se complementan datos.
		// El bloqueo de la fila coordina la nota de crédito con una anulación simultánea de la misma factura.
		let originalInvoice: InvoiceOrmEntity | null = null;
		const requestedDocNumber = (dto.modified_document_number || '').trim();
		const lockQb = manager.createQueryBuilder(InvoiceOrmEntity, 'i').setLock('pessimistic_write');
		if (dto.invoiceId) {
			const locked = await lockQb
				.where('i.id = :id AND i.company_id = :companyId AND i.deleted = false', { id: dto.invoiceId, companyId })
				.getOne();
			if (!locked) {
				throw new NotFoundException(`La factura ID ${dto.invoiceId} no existe en esta empresa.`);
			}
			originalInvoice = locked;
		} else if (requestedDocNumber && (dto.modified_document_type || '01') === '01') {
			// Sin invoiceId: si el número corresponde a una factura del sistema se aplican las mismas validaciones.
			originalInvoice = await lockQb
				.where('i.invoice_number = :num AND i.company_id = :companyId AND i.deleted = false', { num: requestedDocNumber, companyId })
				.getOne();
		}

		// Cantidad e importe (sin impuestos) facturados y ya acreditados por línea, para no superar lo facturado.
		const invoicedByKey = new Map<string, { qty: number; amount: number }>();
		const creditedByKey = new Map<string, { qty: number; amount: number }>();
		let creditedTotal = 0;
		if (originalInvoice) {
			originalInvoice = await manager.getRepository(InvoiceOrmEntity).findOne({
				where: { id: originalInvoice.id, company: { id: companyId }, deleted: false },
				relations: ['details'],
			});
			if (!originalInvoice) throw new NotFoundException('La factura modificada no existe en esta empresa.');

			if (originalInvoice.status === 'CANCELED') {
				throw new BadRequestException(`La factura ${originalInvoice.invoice_number} está anulada; no admite notas de crédito.`);
			}
			if (originalInvoice.sri_status !== 'AUTHORIZED') {
				throw new BadRequestException(
					`La factura ${originalInvoice.invoice_number} no está autorizada por el SRI; solo se emiten notas de crédito sobre facturas autorizadas.`,
				);
			}
			if (requestedDocNumber && requestedDocNumber !== originalInvoice.invoice_number) {
				throw new BadRequestException(
					`El número de comprobante modificado (${requestedDocNumber}) no coincide con la factura ${originalInvoice.invoice_number}.`,
				);
			}

			for (const d of originalInvoice.details || []) {
				const key = lineKey(d);
				const cur = invoicedByKey.get(key) || { qty: 0, amount: 0 };
				cur.qty += Number(d.quantity || 0);
				cur.amount += Number(d.subtotal || 0);
				invoicedByKey.set(key, cur);
			}

			// Notas de crédito previas vigentes (no anuladas ni eliminadas) de la misma factura.
			const previousNotes = await manager
				.createQueryBuilder(CreditNoteOrmEntity, 'cn')
				.leftJoinAndSelect('cn.details', 'd')
				.where('cn.company_id = :companyId AND cn.deleted = false', { companyId })
				.andWhere("cn.status <> 'CANCELED'")
				.andWhere("(cn.invoice_id = :invoiceId OR (cn.modified_document_type = '01' AND cn.modified_document_number = :num))", {
					invoiceId: originalInvoice.id,
					num: originalInvoice.invoice_number,
				})
				.getMany();
			for (const note of previousNotes) {
				creditedTotal += Number(note.total || 0);
				for (const d of note.details || []) {
					const key = lineKey(d);
					const cur = creditedByKey.get(key) || { qty: 0, amount: 0 };
					cur.qty += Number(d.quantity || 0);
					cur.amount += Number(d.subtotal || 0);
					creditedByKey.set(key, cur);
				}
			}
		}

		const customerIdType = dto.customer_id_type || originalInvoice?.customer_id_type || '05';
		const customerIdNumber = (dto.customer_id_number || originalInvoice?.customer_id_number || '').trim();
		const customerName = (dto.customer_name || originalInvoice?.customer_name || '').trim();
		const customerAddress = (dto.customer_address || originalInvoice?.customer_address || '').trim();
		const customerEmail = (dto.customer_email || originalInvoice?.customer_email || '').trim();
		const customerPhone = (dto.customer_phone || originalInvoice?.customer_phone || '').trim();

		// Con factura del sistema, el número y la fecha del documento modificado son los de esa factura.
		const modifiedDocNumber = originalInvoice?.invoice_number || requestedDocNumber;
		const modifiedDocDate = originalInvoice?.issue_date || dto.modified_document_date || issueDate;

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
			const qty = Number(d.quantity);
			const unitPrice = Number(d.unit_price || 0);
			const discount = Number(d.discount || 0);
			const taxRate = Number(d.tax_rate ?? 15);
			// El tipo que se guarda en la línea es el mismo con el que se decide el reingreso a inventario.
			const itemType = d.item_type || 'PRODUCT';

			if (!Number.isFinite(qty) || qty <= 0) {
				throw new BadRequestException(`La cantidad de "${d.description}" debe ser mayor a 0.`);
			}
			if (!Number.isFinite(unitPrice) || unitPrice < 0) {
				throw new BadRequestException(`El precio unitario de "${d.description}" no puede ser negativo.`);
			}
			if (!Number.isFinite(discount) || discount < 0) {
				throw new BadRequestException(`El descuento de "${d.description}" no puede ser negativo.`);
			}
			if (discount > qty * unitPrice + 1e-9) {
				throw new BadRequestException(`El descuento de "${d.description}" no puede superar el importe de la línea.`);
			}
			if (!isSupportedIvaRate(taxRate)) {
				throw new BadRequestException(`La tarifa de IVA ${taxRate}% de "${d.description}" no está soportada para el SRI.`);
			}

			const rowSubtotal = Math.max(0, qty * unitPrice - discount);
			const rowTax = Number(((rowSubtotal * taxRate) / 100).toFixed(2));
			const rowTotal = Number((rowSubtotal + rowTax).toFixed(2));

			if (originalInvoice) {
				// El ítem debe pertenecer a la factura y, sumado a las notas de crédito previas, no superar lo facturado.
				const key = lineKey({ item_type: itemType, item_id: d.item_id, code: d.code, description: d.description });
				const invoiced = invoicedByKey.get(key);
				if (!invoiced) {
					throw new BadRequestException(`El ítem "${d.description}" no pertenece a la factura ${originalInvoice.invoice_number}.`);
				}
				const credited = creditedByKey.get(key) || { qty: 0, amount: 0 };
				credited.qty += qty;
				credited.amount += rowSubtotal;
				creditedByKey.set(key, credited);
				if (credited.qty > invoiced.qty + 0.00005) {
					throw new BadRequestException(
						`La cantidad acreditada de "${d.description}" (${credited.qty.toFixed(4)}, incluidas notas de crédito previas) supera la facturada (${invoiced.qty.toFixed(4)}).`,
					);
				}
				if (credited.amount > invoiced.amount + 0.005) {
					throw new BadRequestException(
						`El importe acreditado de "${d.description}" (${credited.amount.toFixed(2)}, incluidas notas de crédito previas) supera el facturado (${invoiced.amount.toFixed(2)}).`,
					);
				}
			}

			if (taxRate > 0) {
				subtotalTaxable += rowSubtotal;
			} else {
				subtotalZero += rowSubtotal;
			}

			discountTotal += discount;
			taxTotal += rowTax;

			const detailWarehouseId = d.warehouse_id || defaultWarehouseId;

			const detail = detailRepo.create({
				item_type: itemType,
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
			const isPhysical = itemType === 'PRODUCT' || itemType === 'ITEM';
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

		if (originalInvoice && creditedTotal + total > Number(originalInvoice.total || 0) + 0.005) {
			throw new BadRequestException(
				`El total acreditado (${(creditedTotal + total).toFixed(2)}, incluidas notas de crédito previas) supera el total de la factura ${originalInvoice.invoice_number} (${Number(originalInvoice.total || 0).toFixed(2)}).`,
			);
		}

		const creditNote = cnRepo.create({
			company: { id: companyId } as any,
			invoice: originalInvoice ? ({ id: originalInvoice.id } as any) : null,
			branch_id: branch.id,
			branch_address: branch.address,
			logo_url: branch.logo_url || company.logo_url || null,
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

		// Actualizar correlativo de NOTAS DE CRÉDITO en el punto de emisión (solo si avanza, igual que en facturas).
		// Sin try/catch: si estas consultas fallan la transacción queda abortada y el error real debe propagarse.
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
				  AND s.document_type = $5
				  AND s.correlative < $1;
			`, [numericSeq, companyId, branch.id, emissionPoint, CREDIT_NOTE_SEQUENCE_TYPE]);

			// Si aún no existía la fila de secuencia para NOTAS DE CRÉDITO en este punto, insertarla (nunca duplicarla)
			await manager.query(`
				INSERT INTO tab_emission_point_sequence (company_id, emission_point_id, document_type, document_code, serie, correlative, enabled, created_at, updated_at)
				SELECT p.company_id, p.id, $5, '04', p.serie, $1, true, NOW(), NOW()
				FROM tab_emission_point p
				WHERE p.company_id = $2 AND p.branch_id = $3 AND p.serie = $4
				  AND NOT EXISTS (
					SELECT 1 FROM tab_emission_point_sequence s
					WHERE s.emission_point_id = p.id AND s.document_type = $5
				  );
			`, [numericSeq, companyId, branch.id, emissionPoint, CREDIT_NOTE_SEQUENCE_TYPE]);
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
		const branch = await this.dataSource.getRepository(BranchCompanyOrmEntity).findOne({
			where: { id: branchId, company: { id: companyId }, deleted: false },
		});
		const establishment = branch ? branch.code.padStart(3, '0') : '001';
		const sequential = await this.getNextSequential(this.creditNoteRepo.manager, companyId, branchId, establishment, emissionPoint);
		return {
			establishment,
			emission_point: emissionPoint,
			sequential,
			full_number: `${establishment}-${emissionPoint}-${sequential}`,
		};
	}

	/**
	 * Firma y envía la Nota de Crédito al SRI (Recepción y Autorización)
	 */
	async sendToSri(id: number, companyId: number) {
		const cn = await this.findById(id, companyId);
		if (cn.status === 'CANCELED') throw new BadRequestException('No se puede enviar al SRI una nota de crédito anulada.');

		if (cn.sri_status === 'AUTHORIZED') {
			return this.buildSriResult(
				id,
				'AUTHORIZED',
				'Esta nota de crédito ya está autorizada por el SRI.',
				cn.sri_messages || [],
				cn.sri_authorization_number,
				cn.sri_authorization_date,
			);
		}
		// Ya fue recibida por el SRI: no se reenvía el mismo comprobante a recepción, solo se consulta la autorización.
		if (cn.sri_status === 'IN_PROCESS') {
			return this.checkSriAuthorization(id, companyId);
		}

		const company = await this.companyRepo
			.createQueryBuilder('c')
			.addSelect(['c.cert_p12_base64', 'c.cert_password_enc'])
			.where('c.id = :companyId', { companyId })
			.getOne();
		if (!company) throw new NotFoundException('Empresa no encontrada.');

		// 1. Obtener o generar XML firmado. signed_xml es select:false, por eso se carga aparte: sin esto se
		//    volvería a firmar en cada envío. Tras una devolución o rechazo sí se regenera y refirma.
		const stored = await this.creditNoteRepo
			.createQueryBuilder('cn')
			.select('cn.id')
			.addSelect('cn.signed_xml')
			.where('cn.id = :id AND cn.company_id = :companyId AND cn.deleted = false', { id, companyId })
			.getOne();
		const wasRejected = cn.sri_status === 'RETURNED' || cn.sri_status === 'NOT_AUTHORIZED';

		let signedXml: string;
		if (!wasRejected && cn.sign_status === 'SIGNED' && stored?.signed_xml) {
			signedXml = stored.signed_xml;
		} else {
			if (!company.cert_p12_base64 || !company.cert_password_enc) {
				throw new BadRequestException('La empresa no tiene configurada la firma electrónica (.p12) en Configuración > Empresas.');
			}
			try {
				const parsedP12 = loadP12(company.cert_p12_base64, decryptSecret(company.cert_password_enc));
				if (parsedP12.notAfter.getTime() < Date.now()) {
					throw new Error(`La firma electrónica caducó el ${parsedP12.notAfter.toISOString().slice(0, 10)}.`);
				}
				const canonicalXml = buildCreditNoteXml(cn, company);
				signedXml = signXadesBes(canonicalXml, parsedP12);
			} catch (e: any) {
				throw new BadRequestException(e?.message || 'No se pudo firmar la nota de crédito.');
			}
			await this.creditNoteRepo.update({ id }, { signed_xml: signedXml, signed_at: new Date(), sign_status: 'SIGNED' });
		}

		// 2. Recepción SRI
		const env: SriEnvironment = company.sri_environment === '2' ? '2' : '1';
		let receptionRes;
		try {
			receptionRes = await sriReception(signedXml, env);
		} catch (e: any) {
			throw new BadRequestException(e?.message || 'No se pudo enviar la nota de crédito al SRI.');
		}

		const sentAt = new Date();
		if (receptionRes.estado !== 'RECIBIDA') {
			const messages = receptionRes.mensajes || [];
			await this.creditNoteRepo.update(
				{ id },
				{ sri_status: 'RETURNED', sri_sent_at: sentAt, sri_messages: messages, sri_response_xml: receptionRes.rawXml || null },
			);
			return this.buildSriResult(id, 'RETURNED', 'El SRI devolvió la nota de crédito por inconsistencias.', messages);
		}

		// Recibida: se guarda EN PROCESO antes de consultar, para que un fallo posterior no pierda la recepción.
		await this.creditNoteRepo.update(
			{ id },
			{ sri_status: 'IN_PROCESS', sri_sent_at: sentAt, sri_messages: receptionRes.mensajes || [], sri_response_xml: receptionRes.rawXml || null },
		);

		// 3. Autorización SRI con reintentos
		await sleep(2000);
		try {
			return await this.checkSriAuthorization(id, companyId, 3);
		} catch (e: any) {
			// La recepción fue correcta; si falla la consulta, la nota queda EN PROCESO y se puede consultar más tarde.
			return this.buildSriResult(
				id,
				'IN_PROCESS',
				'El SRI recibió la nota de crédito, pero no se pudo consultar su autorización. Vuelve a consultarla en unos minutos.',
				[
					{
						identificador: 'CONSULTA-PENDIENTE',
						mensaje: 'El SRI recibió la nota de crédito, pero no se pudo consultar su autorización. Vuelve a consultarla en unos minutos.',
						informacionAdicional: e?.message,
						tipo: 'ADVERTENCIA',
					},
				],
			);
		}
	}

	/** Consulta al SRI la autorización de una nota de crédito ya enviada y actualiza su estado. */
	async checkSriAuthorization(id: number, companyId: number, retries = 0) {
		const cn = await this.findById(id, companyId);
		if (cn.status === 'CANCELED') {
			throw new BadRequestException('La nota de crédito está anulada; no se consulta ni se actualiza su autorización en el SRI.');
		}
		if (!cn.access_key) throw new BadRequestException('La nota de crédito no tiene clave de acceso.');
		if (!cn.sri_status || cn.sri_status === 'NOT_SENT') {
			throw new BadRequestException('La nota de crédito aún no ha sido recibida por el SRI. Envíala primero.');
		}
		if (cn.sri_status === 'AUTHORIZED') {
			return this.buildSriResult(
				id,
				'AUTHORIZED',
				'Esta nota de crédito ya está autorizada por el SRI.',
				cn.sri_messages || [],
				cn.sri_authorization_number,
				cn.sri_authorization_date,
			);
		}

		const company = await this.companyRepo.findOne({ where: { id: companyId }, select: ['id', 'sri_environment'] });
		if (!company) throw new NotFoundException('Empresa no encontrada.');
		const env: SriEnvironment = company.sri_environment === '2' ? '2' : '1';

		let authResult;
		try {
			authResult = await sriAuthorization(cn.access_key, env);
			for (let retry = 0; retry < retries && authResult.estado === 'EN PROCESO'; retry++) {
				await sleep(2000);
				authResult = await sriAuthorization(cn.access_key, env);
			}
		} catch (e: any) {
			throw new BadRequestException(e?.message || 'No se pudo consultar la autorización en el SRI.');
		}

		if (authResult.estado === 'AUTORIZADO') {
			const authorizationNumber = authResult.numeroAutorizacion || cn.access_key;
			const authorizationDate = authResult.fechaAutorizacion ? new Date(authResult.fechaAutorizacion) : new Date();
			await this.creditNoteRepo.update(
				{ id },
				{
					sri_status: 'AUTHORIZED',
					status: 'AUTHORIZED',
					sri_authorization_number: authorizationNumber,
					sri_authorization_date: authorizationDate,
					sri_messages: authResult.mensajes,
					sri_response_xml: authResult.rawXml || null,
				},
			);
			return this.buildSriResult(
				id,
				'AUTHORIZED',
				'Nota de crédito AUTORIZADA correctamente por el SRI.',
				authResult.mensajes || [],
				authorizationNumber,
				authorizationDate,
			);
		}

		if (authResult.estado === 'NO AUTORIZADO') {
			await this.creditNoteRepo.update(
				{ id },
				{ sri_status: 'NOT_AUTHORIZED', sri_messages: authResult.mensajes, sri_response_xml: authResult.rawXml || null },
			);
			return this.buildSriResult(id, 'NOT_AUTHORIZED', 'La nota de crédito NO fue autorizada por el SRI.', authResult.mensajes || []);
		}

		// El SRI no tiene respuesta para la clave. Si la nota estaba devuelta o no autorizada se conserva ese estado
		// (así puede corregirse y reenviarse); solo una nota recibida sigue EN PROCESO.
		if (cn.sri_status !== 'IN_PROCESS') {
			return this.buildSriResult(id, cn.sri_status, 'El SRI no tiene una autorización registrada para esta nota de crédito.', cn.sri_messages || []);
		}
		await this.creditNoteRepo.update({ id }, { sri_status: 'IN_PROCESS', sri_response_xml: authResult.rawXml || null });
		return this.buildSriResult(
			id,
			'IN_PROCESS',
			'La nota de crédito fue RECIBIDA por el SRI y se encuentra en procesamiento.',
			authResult.mensajes || [],
		);
	}

	private buildSriResult(
		id: number,
		sriStatus: string,
		message: string,
		messages: SriMessage[],
		authorizationNumber?: string | null,
		authorizationDate?: Date | string | null,
	) {
		return {
			id,
			// Solo AUTHORIZED es éxito: una nota EN PROCESO todavía no tiene validez tributaria.
			success: sriStatus === 'AUTHORIZED',
			status: sriStatus,
			sri_status: sriStatus,
			message,
			authorizationNumber: authorizationNumber ?? null,
			sri_authorization_number: authorizationNumber ?? null,
			authorizationDate: authorizationDate ?? null,
			sri_authorization_date: authorizationDate ?? null,
			sri_messages: messages || [],
			sriMessages: messages || [],
		};
	}

	async getSignedXml(id: number, companyId: number): Promise<{ file_name: string; xml: string }> {
		const cn = await this.creditNoteRepo
			.createQueryBuilder('cn')
			.addSelect('cn.signed_xml')
			.where('cn.id = :id AND cn.company_id = :companyId AND cn.deleted = false', { id, companyId })
			.getOne();

		if (!cn || !cn.signed_xml) {
			throw new NotFoundException('La nota de crédito no tiene un XML firmado disponible.');
		}
		const fileName = cn.access_key ? `${cn.access_key}.xml` : `NotaCredito_${cn.id}.xml`;
		return { file_name: fileName, xml: cn.signed_xml };
	}
}
