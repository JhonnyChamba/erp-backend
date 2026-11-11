import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
	PurchaseOrmEntity,
	PurchaseDetailOrmEntity,
} from '../infrastructure/persistence/purchase.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { InventoryWarehouseOrmEntity } from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
import { InventoryService } from 'src/modules/inventory/application/inventory.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
	constructor(
		@InjectRepository(PurchaseOrmEntity)
		private readonly purchaseRepo: Repository<PurchaseOrmEntity>,
		@InjectRepository(PurchaseDetailOrmEntity)
		private readonly purchaseDetailRepo: Repository<PurchaseDetailOrmEntity>,
		@InjectRepository(CompanyOrmEntity)
		private readonly companyRepo: Repository<CompanyOrmEntity>,
		@InjectRepository(InventoryWarehouseOrmEntity)
		private readonly warehouseRepo: Repository<InventoryWarehouseOrmEntity>,
		private readonly inventoryService: InventoryService,
		@InjectDataSource()
		private readonly dataSource: DataSource,
	) {}

	/**
	 * Registra una compra e ingresa automáticamente las existencias en inventario por bodega
	 */
	async createPurchase(companyId: number, dto: CreatePurchaseDto, userId?: number) {
		if (!dto.items || dto.items.length === 0) {
			throw new BadRequestException('La compra debe contener al menos un ítem o producto');
		}

		return await this.dataSource.transaction(async (manager) => {
			const warehouseId = dto.warehouse_id ?? dto.warehouseId;
			const warehouse = await manager.findOne(InventoryWarehouseOrmEntity, {
				where: { id: warehouseId, company: { id: companyId }, deleted: false },
			});
			if (!warehouse) {
				throw new BadRequestException('La bodega de destino seleccionada no existe o no pertenece a la empresa');
			}
			if (!warehouse.enabled) {
				throw new BadRequestException(`La bodega "${warehouse.name}" está inactiva y no puede recibir mercadería`);
			}

			// Formatear número de comprobante estándar SRI: 001-001-000012345
			const establishment = (dto.establishment || '001').padStart(3, '0');
			const emissionPoint = (dto.emission_point || '001').padStart(3, '0');
			const rawSequential = (dto.sequential || '1').replace(/\D/g, '');
			const sequential = rawSequential.padStart(9, '0');
			const invoiceNumber = `${establishment}-${emissionPoint}-${sequential}`;

			// Totales
			let subtotalZero = 0;
			let subtotalTaxed = 0;
			let taxValue = 0;

			const detailEntities: PurchaseDetailOrmEntity[] = [];

			for (const item of dto.items) {
				const qty = Number(item.quantity);
				const unitCost = Number(item.unit_cost ?? item.unitCost ?? 0);
				const taxRate = Number(item.tax_rate ?? item.taxRate ?? 15);
				const subtotal = Math.round(qty * unitCost * 100) / 100;
				const itemTax = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
				const total = Math.round((subtotal + itemTax) * 100) / 100;

				if (taxRate > 0) {
					subtotalTaxed += subtotal;
					taxValue += itemTax;
				} else {
					subtotalZero += subtotal;
				}

				const detail = manager.create(PurchaseDetailOrmEntity, {
					item_type: item.item_type || 'PRODUCT',
					item_id: item.item_id ?? item.itemId,
					code: item.code || '',
					description: item.description.trim(),
					unit: item.unit || 'UND',
					quantity: qty,
					unit_cost: unitCost,
					tax_rate: taxRate,
					tax_value: itemTax,
					subtotal,
					total,
				});
				detailEntities.push(detail);
			}

			subtotalZero = Math.round(subtotalZero * 100) / 100;
			subtotalTaxed = Math.round(subtotalTaxed * 100) / 100;
			taxValue = Math.round(taxValue * 100) / 100;
			const totalAmount = Math.round((subtotalZero + subtotalTaxed + taxValue) * 100) / 100;

			// Guardar cabecera de compra
			const purchase = manager.create(PurchaseOrmEntity, {
				company: { id: companyId } as any,
				provider_id: dto.provider_id ?? dto.providerId ?? null,
				provider_name: (dto.provider_name || dto.providerName || '').trim(),
				provider_id_type: dto.provider_id_type || '04',
				provider_id_number: (dto.provider_id_number || dto.providerIdNumber || '').trim(),
				provider_email: dto.provider_email || '',
				provider_phone: dto.provider_phone || '',
				provider_address: dto.provider_address || '',
				establishment,
				emission_point: emissionPoint,
				sequential,
				invoice_number: invoiceNumber,
				authorization_number: dto.authorization_number?.trim() || null,
				issue_date: dto.issue_date,
				warehouse_id: warehouse.id,
				warehouse_name: warehouse.name,
				branch_id: dto.branch_id || null,
				payment_method: dto.payment_method || 'contado',
				notes: dto.notes || '',
				status: 'COMPLETED',
				subtotal_zero_tax: subtotalZero,
				subtotal_taxed: subtotalTaxed,
				tax_value: taxValue,
				total: totalAmount,
				details: detailEntities,
				created_by: userId,
			});

			const savedPurchase = await manager.save(PurchaseOrmEntity, purchase);

			// Afectar el inventario para cada ítem físico
			for (const detail of detailEntities) {
				const isPhysical = detail.item_type === 'PRODUCT' || detail.item_type === 'ITEM' || !detail.item_type;
				if (isPhysical && detail.item_id) {
					await this.inventoryService.registerEntry(
						{
							companyId,
							warehouseId: warehouse.id,
							productId: detail.item_id,
							quantity: Number(detail.quantity),
							unitCost: Number(detail.unit_cost),
							movementReason: 'PURCHASE',
							collectionOriginName: 'PURCHASE_INVOICE',
							collectionOriginDocument: `Factura Compra ${invoiceNumber}`,
							createdUserId: userId,
						},
						manager,
					);
				}
			}

			return await manager.findOne(PurchaseOrmEntity, {
				where: { id: savedPurchase.id },
				relations: ['details'],
			});
		});
	}

	/**
	 * Listar compras de una empresa
	 */
	async listPurchases(companyId: number, query?: { q?: string; warehouseId?: number; status?: string }) {
		const qb = this.purchaseRepo
			.createQueryBuilder('p')
			.leftJoinAndSelect('p.details', 'd')
			.where('p.company_id = :companyId', { companyId })
			.orderBy('p.id', 'DESC');

		if (query?.warehouseId) {
			qb.andWhere('p.warehouse_id = :wId', { wId: Number(query.warehouseId) });
		}

		if (query?.status) {
			qb.andWhere('p.status = :status', { status: query.status });
		}

		if (query?.q?.trim()) {
			const term = `%${query.q.trim().toLowerCase()}%`;
			qb.andWhere(
				'(LOWER(p.invoice_number) LIKE :term OR LOWER(p.provider_name) LIKE :term OR LOWER(p.provider_id_number) LIKE :term)',
				{ term },
			);
		}

		return await qb.getMany();
	}

	/**
	 * Obtener detalle de una compra
	 */
	async getPurchaseById(id: number, companyId: number) {
		const purchase = await this.purchaseRepo.findOne({
			where: { id, company: { id: companyId } },
			relations: ['details'],
		});
		if (!purchase) {
			throw new NotFoundException('Compra no encontrada');
		}
		return purchase;
	}

	/**
	 * Anular una compra y revertir el ingreso en inventario
	 */
	async cancelPurchase(id: number, companyId: number, userId?: number) {
		return await this.dataSource.transaction(async (manager) => {
			const purchase = await manager.findOne(PurchaseOrmEntity, {
				where: { id, company: { id: companyId } },
				relations: ['details'],
			});
			if (!purchase) {
				throw new NotFoundException('Compra no encontrada');
			}
			if (purchase.status === 'CANCELED') {
				throw new BadRequestException('Esta compra ya ha sido anulada previamente');
			}

			// Revertir inventario mediante SUPPLIER_RETURN
			for (const detail of purchase.details) {
				const isPhysical = detail.item_type === 'PRODUCT' || detail.item_type === 'ITEM' || !detail.item_type;
				if (isPhysical && detail.item_id && purchase.warehouse_id) {
					await this.inventoryService.registerExit(
						{
							companyId,
							warehouseId: purchase.warehouse_id,
							productId: detail.item_id,
							quantity: Number(detail.quantity),
							movementReason: 'SUPPLIER_RETURN',
							collectionOriginName: 'PURCHASE_CANCEL',
							collectionOriginDocument: `Anulación Compra #${purchase.id} (${purchase.invoice_number})`,
							createdUserId: userId,
						},
						manager,
					);
				}
			}

			purchase.status = 'CANCELED';
			return await manager.save(PurchaseOrmEntity, purchase);
		});
	}
}
