"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_orm_entity_1 = require("../infrastructure/persistence/purchase.orm-entity");
const company_orm_entity_1 = require("../../company/infrastructure/persistence/company.orm-entity");
const inventory_orm_entity_1 = require("../../inventory/infrastructure/persistence/inventory.orm-entity");
const inventory_service_1 = require("../../inventory/application/inventory.service");
let PurchasesService = class PurchasesService {
    purchaseRepo;
    purchaseDetailRepo;
    companyRepo;
    warehouseRepo;
    inventoryService;
    dataSource;
    constructor(purchaseRepo, purchaseDetailRepo, companyRepo, warehouseRepo, inventoryService, dataSource) {
        this.purchaseRepo = purchaseRepo;
        this.purchaseDetailRepo = purchaseDetailRepo;
        this.companyRepo = companyRepo;
        this.warehouseRepo = warehouseRepo;
        this.inventoryService = inventoryService;
        this.dataSource = dataSource;
    }
    async createPurchase(companyId, dto, userId) {
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('La compra debe contener al menos un ítem o producto');
        }
        return await this.dataSource.transaction(async (manager) => {
            const warehouseId = dto.warehouse_id ?? dto.warehouseId;
            const warehouse = await manager.findOne(inventory_orm_entity_1.InventoryWarehouseOrmEntity, {
                where: { id: warehouseId, company: { id: companyId }, deleted: false },
            });
            if (!warehouse) {
                throw new common_1.BadRequestException('La bodega de destino seleccionada no existe o no pertenece a la empresa');
            }
            if (!warehouse.enabled) {
                throw new common_1.BadRequestException(`La bodega "${warehouse.name}" está inactiva y no puede recibir mercadería`);
            }
            const establishment = (dto.establishment || '001').padStart(3, '0');
            const emissionPoint = (dto.emission_point || '001').padStart(3, '0');
            const rawSequential = (dto.sequential || '1').replace(/\D/g, '');
            const sequential = rawSequential.padStart(9, '0');
            const invoiceNumber = `${establishment}-${emissionPoint}-${sequential}`;
            let subtotalZero = 0;
            let subtotalTaxed = 0;
            let taxValue = 0;
            const detailEntities = [];
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
                }
                else {
                    subtotalZero += subtotal;
                }
                const detail = manager.create(purchase_orm_entity_1.PurchaseDetailOrmEntity, {
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
            const purchase = manager.create(purchase_orm_entity_1.PurchaseOrmEntity, {
                company: { id: companyId },
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
            const savedPurchase = await manager.save(purchase_orm_entity_1.PurchaseOrmEntity, purchase);
            for (const detail of detailEntities) {
                const isPhysical = detail.item_type === 'PRODUCT' || detail.item_type === 'ITEM' || !detail.item_type;
                if (isPhysical && detail.item_id) {
                    await this.inventoryService.registerEntry({
                        companyId,
                        warehouseId: warehouse.id,
                        productId: detail.item_id,
                        quantity: Number(detail.quantity),
                        unitCost: Number(detail.unit_cost),
                        movementReason: 'PURCHASE',
                        collectionOriginName: 'PURCHASE_INVOICE',
                        collectionOriginDocument: `Factura Compra ${invoiceNumber}`,
                        createdUserId: userId,
                    }, manager);
                }
            }
            return await manager.findOne(purchase_orm_entity_1.PurchaseOrmEntity, {
                where: { id: savedPurchase.id },
                relations: ['details'],
            });
        });
    }
    async listPurchases(companyId, query) {
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
            qb.andWhere('(LOWER(p.invoice_number) LIKE :term OR LOWER(p.provider_name) LIKE :term OR LOWER(p.provider_id_number) LIKE :term)', { term });
        }
        return await qb.getMany();
    }
    async getPurchaseById(id, companyId) {
        const purchase = await this.purchaseRepo.findOne({
            where: { id, company: { id: companyId } },
            relations: ['details'],
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Compra no encontrada');
        }
        return purchase;
    }
    async cancelPurchase(id, companyId, userId) {
        return await this.dataSource.transaction(async (manager) => {
            const purchase = await manager.findOne(purchase_orm_entity_1.PurchaseOrmEntity, {
                where: { id, company: { id: companyId } },
                relations: ['details'],
            });
            if (!purchase) {
                throw new common_1.NotFoundException('Compra no encontrada');
            }
            if (purchase.status === 'CANCELED') {
                throw new common_1.BadRequestException('Esta compra ya ha sido anulada previamente');
            }
            for (const detail of purchase.details) {
                const isPhysical = detail.item_type === 'PRODUCT' || detail.item_type === 'ITEM' || !detail.item_type;
                if (isPhysical && detail.item_id && purchase.warehouse_id) {
                    await this.inventoryService.registerExit({
                        companyId,
                        warehouseId: purchase.warehouse_id,
                        productId: detail.item_id,
                        quantity: Number(detail.quantity),
                        movementReason: 'SUPPLIER_RETURN',
                        collectionOriginName: 'PURCHASE_CANCEL',
                        collectionOriginDocument: `Anulación Compra #${purchase.id} (${purchase.invoice_number})`,
                        createdUserId: userId,
                    }, manager);
                }
            }
            purchase.status = 'CANCELED';
            return await manager.save(purchase_orm_entity_1.PurchaseOrmEntity, purchase);
        });
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_orm_entity_1.PurchaseOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_orm_entity_1.PurchaseDetailOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryWarehouseOrmEntity)),
    __param(5, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        inventory_service_1.InventoryService,
        typeorm_2.DataSource])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map