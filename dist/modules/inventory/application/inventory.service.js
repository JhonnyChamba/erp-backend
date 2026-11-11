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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = __importDefault(require("decimal.js"));
const crypto_1 = require("crypto");
const inventory_orm_entity_1 = require("../infrastructure/persistence/inventory.orm-entity");
let InventoryService = class InventoryService {
    itemRepo;
    serviceRepo;
    subcontractRepo;
    categoryRepo;
    warehouseRepo;
    unifiedItemRepo;
    balanceRepo;
    movementRepo;
    dataSource;
    constructor(itemRepo, serviceRepo, subcontractRepo, categoryRepo, warehouseRepo, unifiedItemRepo, balanceRepo, movementRepo, dataSource) {
        this.itemRepo = itemRepo;
        this.serviceRepo = serviceRepo;
        this.subcontractRepo = subcontractRepo;
        this.categoryRepo = categoryRepo;
        this.warehouseRepo = warehouseRepo;
        this.unifiedItemRepo = unifiedItemRepo;
        this.balanceRepo = balanceRepo;
        this.movementRepo = movementRepo;
        this.dataSource = dataSource;
    }
    async generateNextCode(repo, companyId, defaultPrefix) {
        const all = await repo.find({
            where: { company: { id: companyId } },
            select: ['id', 'code'],
            order: { id: 'DESC' },
        });
        if (all.length === 0) {
            return `${defaultPrefix}001`;
        }
        const last = all[0];
        const match = String(last.code || '').trim().match(/^(.*?)(\d+)$/);
        let prefix = defaultPrefix;
        let padLen = 3;
        let nextNum = all.length + 1;
        if (match) {
            prefix = match[1];
            padLen = match[2].length;
            nextNum = parseInt(match[2], 10) + 1;
        }
        const existingCodes = new Set(all.map((r) => String(r.code || '').toUpperCase()));
        let candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
        while (existingCodes.has(candidate.toUpperCase())) {
            nextNum++;
            candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
        }
        return candidate;
    }
    async listItems(companyId) {
        const rows = await this.itemRepo.find({
            where: { company: { id: companyId }, deleted: false },
            relations: ['company'],
            order: { id: 'DESC' },
        });
        return rows.map((r) => this.mapItem(r));
    }
    async createItem(dto, companyId, userId) {
        const nextCode = dto.code?.trim() || (await this.generateNextCode(this.itemRepo, companyId, 'ART-'));
        const categoryId = dto.category_id ?? dto.categoryId;
        let categoryName = dto.category?.trim();
        if (categoryId && !categoryName) {
            const cat = await this.categoryRepo.findOne({ where: { id: Number(categoryId), company: { id: companyId } } });
            if (cat)
                categoryName = cat.name;
        }
        const entity = this.itemRepo.create({
            code: nextCode,
            sku: dto.sku || '',
            name: dto.name,
            category_id: categoryId ? Number(categoryId) : undefined,
            category: categoryName || 'General',
            unit_measure: dto.unit_measure || dto.unit || 'UND',
            cost_price: Number(dto.cost_price ?? dto.costPrice ?? 0),
            sale_price: Number(dto.sale_price ?? dto.salePrice ?? 0),
            tax_rate: Number(dto.tax_rate ?? dto.taxRate ?? 15),
            stock_current: Number(dto.stock_current ?? dto.stockCurrent ?? 0),
            stock_min: Number(dto.stock_min ?? dto.stockMin ?? 0),
            warehouse_id: (dto.warehouse_id ?? dto.warehouseId) ? Number(dto.warehouse_id ?? dto.warehouseId) : undefined,
            warehouse_location: dto.warehouse_location || dto.location || 'Bodega Principal',
            description: dto.description || '',
            enabled: dto.enabled ?? dto.status ?? true,
            deleted: false,
            company: { id: companyId },
            created_by: userId,
        });
        const saved = await this.itemRepo.save(entity);
        return this.mapItem(saved, companyId);
    }
    async updateItem(id, companyId, dto) {
        const existing = await this.itemRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
            relations: ['company'],
        });
        if (!existing)
            throw new common_1.NotFoundException('Artículo no encontrado');
        existing.sku = dto.sku ?? existing.sku;
        existing.name = dto.name ?? existing.name;
        const categoryId = dto.category_id ?? dto.categoryId;
        if (categoryId !== undefined)
            existing.category_id = Number(categoryId);
        let categoryName = dto.category;
        if (categoryId && !categoryName) {
            const cat = await this.categoryRepo.findOne({ where: { id: Number(categoryId), company: { id: companyId } } });
            if (cat)
                categoryName = cat.name;
        }
        if (categoryName !== undefined)
            existing.category = categoryName;
        existing.unit_measure = dto.unit_measure ?? dto.unit ?? existing.unit_measure;
        const costPrice = dto.cost_price ?? dto.costPrice;
        if (costPrice !== undefined)
            existing.cost_price = Number(costPrice);
        const salePrice = dto.sale_price ?? dto.salePrice;
        if (salePrice !== undefined)
            existing.sale_price = Number(salePrice);
        const taxRate = dto.tax_rate ?? dto.taxRate;
        if (taxRate !== undefined)
            existing.tax_rate = Number(taxRate);
        const stockCurrent = dto.stock_current ?? dto.stockCurrent;
        if (stockCurrent !== undefined)
            existing.stock_current = Number(stockCurrent);
        const stockMin = dto.stock_min ?? dto.stockMin;
        if (stockMin !== undefined)
            existing.stock_min = Number(stockMin);
        const warehouseId = dto.warehouse_id ?? dto.warehouseId;
        if (warehouseId !== undefined)
            existing.warehouse_id = Number(warehouseId);
        existing.warehouse_location = dto.warehouse_location ?? dto.location ?? existing.warehouse_location;
        existing.description = dto.description ?? existing.description;
        const statusVal = dto.enabled ?? dto.status;
        if (statusVal !== undefined)
            existing.enabled = statusVal;
        const saved = await this.itemRepo.save(existing);
        return this.mapItem(saved, companyId);
    }
    async deleteItem(id, companyId) {
        await this.itemRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
        return { deleted: true, id };
    }
    mapItem(r, fallbackCompanyId) {
        const status = r.enabled !== false;
        return {
            id: r.id,
            companyId: r.company?.id || fallbackCompanyId || 1,
            code: r.code,
            sku: r.sku || '',
            name: r.name,
            categoryId: r.category_id,
            category_id: r.category_id,
            category: r.category || 'General',
            unit: r.unit_measure || 'UND',
            unit_measure: r.unit_measure || 'UND',
            costPrice: Number(r.cost_price || 0),
            cost_price: Number(r.cost_price || 0),
            salePrice: Number(r.sale_price || 0),
            sale_price: Number(r.sale_price || 0),
            taxRate: Number(r.tax_rate ?? 15),
            tax_rate: Number(r.tax_rate ?? 15),
            stockCurrent: Number(r.stock_current || 0),
            stock_current: Number(r.stock_current || 0),
            stockMin: Number(r.stock_min || 0),
            stock_min: Number(r.stock_min || 0),
            warehouseId: r.warehouse_id,
            warehouse_id: r.warehouse_id,
            location: r.warehouse_location || 'Bodega Principal',
            warehouse_location: r.warehouse_location || 'Bodega Principal',
            description: r.description || '',
            status,
            enabled: status,
            created_at: r.created_at,
        };
    }
    async listServices(companyId) {
        const rows = await this.serviceRepo.find({
            where: { company: { id: companyId }, deleted: false },
            relations: ['company'],
            order: { id: 'DESC' },
        });
        return rows.map((r) => this.mapService(r));
    }
    async createService(dto, companyId, userId) {
        const nextCode = dto.code?.trim() || (await this.generateNextCode(this.serviceRepo, companyId, 'SRV-'));
        const entity = this.serviceRepo.create({
            code: nextCode,
            name: dto.name,
            category: dto.category || 'Servicios Profesionales',
            billing_unit: dto.billing_unit || dto.unit || 'SERV',
            base_cost: Number(dto.base_cost ?? dto.costPrice ?? 0),
            sale_price: Number(dto.sale_price ?? dto.salePrice ?? 0),
            tax_rate: Number(dto.tax_rate ?? dto.taxRate ?? 15),
            estimated_duration: dto.estimated_duration || dto.estimatedDuration || 'Según alcance',
            description: dto.description || '',
            enabled: dto.enabled ?? dto.status ?? true,
            deleted: false,
            company: { id: companyId },
            created_by: userId,
        });
        const saved = await this.serviceRepo.save(entity);
        return this.mapService(saved, companyId);
    }
    async updateService(id, companyId, dto) {
        const existing = await this.serviceRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
            relations: ['company'],
        });
        if (!existing)
            throw new common_1.NotFoundException('Servicio no encontrado');
        existing.name = dto.name ?? existing.name;
        existing.category = dto.category ?? existing.category;
        existing.billing_unit = dto.billing_unit ?? dto.unit ?? existing.billing_unit;
        const baseCost = dto.base_cost ?? dto.costPrice;
        if (baseCost !== undefined)
            existing.base_cost = Number(baseCost);
        const salePrice = dto.sale_price ?? dto.salePrice;
        if (salePrice !== undefined)
            existing.sale_price = Number(salePrice);
        const taxRate = dto.tax_rate ?? dto.taxRate;
        if (taxRate !== undefined)
            existing.tax_rate = Number(taxRate);
        existing.estimated_duration = dto.estimated_duration ?? dto.estimatedDuration ?? existing.estimated_duration;
        existing.description = dto.description ?? existing.description;
        const statusVal = dto.enabled ?? dto.status;
        if (statusVal !== undefined)
            existing.enabled = statusVal;
        const saved = await this.serviceRepo.save(existing);
        return this.mapService(saved, companyId);
    }
    async deleteService(id, companyId) {
        await this.serviceRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
        return { deleted: true, id };
    }
    mapService(r, fallbackCompanyId) {
        const status = r.enabled !== false;
        return {
            id: r.id,
            companyId: r.company?.id || fallbackCompanyId || 1,
            code: r.code,
            name: r.name,
            category: r.category || 'Servicios Generales',
            unit: r.billing_unit || 'SERV',
            billing_unit: r.billing_unit || 'SERV',
            costPrice: Number(r.base_cost || 0),
            base_cost: Number(r.base_cost || 0),
            salePrice: Number(r.sale_price || 0),
            sale_price: Number(r.sale_price || 0),
            taxRate: Number(r.tax_rate ?? 15),
            tax_rate: Number(r.tax_rate ?? 15),
            estimatedDuration: r.estimated_duration || '',
            estimated_duration: r.estimated_duration || '',
            description: r.description || '',
            status,
            enabled: status,
            created_at: r.created_at,
        };
    }
    async listSubcontracts(companyId) {
        const rows = await this.subcontractRepo.find({
            where: { company: { id: companyId }, deleted: false },
            relations: ['company'],
            order: { id: 'DESC' },
        });
        return rows.map((r) => this.mapSubcontract(r));
    }
    async createSubcontract(dto, companyId, userId) {
        const nextCode = dto.code?.trim() || (await this.generateNextCode(this.subcontractRepo, companyId, 'MO-'));
        const entity = this.subcontractRepo.create({
            code: nextCode,
            name: dto.name,
            specialty_area: dto.specialty_area || dto.specialty || 'Mano de Obra',
            contractor_name: dto.contractor_name || dto.contractorName || '',
            contractor_ruc: dto.contractor_ruc || dto.contractorTaxId || '',
            unit_measure: dto.unit_measure || dto.unit || 'HORA_HOMBRE',
            unit_cost: Number(dto.unit_cost ?? dto.unitCost ?? 0),
            suggested_price: Number(dto.suggested_price ?? dto.suggestedPrice ?? 0),
            tax_rate: Number(dto.tax_rate ?? dto.taxRate ?? 15),
            includes_materials: Boolean(dto.includes_materials ?? dto.includesMaterials),
            description: dto.description || '',
            enabled: dto.enabled ?? dto.status ?? true,
            deleted: false,
            company: { id: companyId },
            created_by: userId,
        });
        const saved = await this.subcontractRepo.save(entity);
        return this.mapSubcontract(saved, companyId);
    }
    async updateSubcontract(id, companyId, dto) {
        const existing = await this.subcontractRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
            relations: ['company'],
        });
        if (!existing)
            throw new common_1.NotFoundException('Registro de subcontratación / mano de obra no encontrado');
        existing.name = dto.name ?? existing.name;
        existing.specialty_area = dto.specialty_area ?? dto.specialty ?? existing.specialty_area;
        existing.contractor_name = dto.contractor_name ?? dto.contractorName ?? existing.contractor_name;
        existing.contractor_ruc = dto.contractor_ruc ?? dto.contractorTaxId ?? existing.contractor_ruc;
        existing.unit_measure = dto.unit_measure ?? dto.unit ?? existing.unit_measure;
        const unitCost = dto.unit_cost ?? dto.unitCost;
        if (unitCost !== undefined)
            existing.unit_cost = Number(unitCost);
        const suggestedPrice = dto.suggested_price ?? dto.suggestedPrice;
        if (suggestedPrice !== undefined)
            existing.suggested_price = Number(suggestedPrice);
        const taxRate = dto.tax_rate ?? dto.taxRate;
        if (taxRate !== undefined)
            existing.tax_rate = Number(taxRate);
        const incMat = dto.includes_materials ?? dto.includesMaterials;
        if (incMat !== undefined)
            existing.includes_materials = Boolean(incMat);
        existing.description = dto.description ?? existing.description;
        const statusVal = dto.enabled ?? dto.status;
        if (statusVal !== undefined)
            existing.enabled = statusVal;
        const saved = await this.subcontractRepo.save(existing);
        return this.mapSubcontract(saved, companyId);
    }
    async deleteSubcontract(id, companyId) {
        await this.subcontractRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
        return { deleted: true, id };
    }
    mapSubcontract(r, fallbackCompanyId) {
        const status = r.enabled !== false;
        return {
            id: r.id,
            companyId: r.company?.id || fallbackCompanyId || 1,
            code: r.code,
            name: r.name,
            specialty: r.specialty_area || 'Mano de Obra',
            specialty_area: r.specialty_area || 'Mano de Obra',
            contractorName: r.contractor_name || '',
            contractor_name: r.contractor_name || '',
            contractorTaxId: r.contractor_ruc || '',
            contractor_ruc: r.contractor_ruc || '',
            unit: r.unit_measure || 'HORA_HOMBRE',
            unit_measure: r.unit_measure || 'HORA_HOMBRE',
            unitCost: Number(r.unit_cost || 0),
            unit_cost: Number(r.unit_cost || 0),
            suggestedPrice: Number(r.suggested_price || 0),
            suggested_price: Number(r.suggested_price || 0),
            taxRate: Number(r.tax_rate ?? 15),
            tax_rate: Number(r.tax_rate ?? 15),
            includesMaterials: Boolean(r.includes_materials),
            includes_materials: Boolean(r.includes_materials),
            description: r.description || '',
            status,
            enabled: status,
            created_at: r.created_at,
        };
    }
    async listCategories(companyId, type) {
        const qb = this.categoryRepo
            .createQueryBuilder('c')
            .where('c.company_id = :companyId AND c.deleted = false', { companyId })
            .orderBy('c.name', 'ASC');
        if (type && type.trim()) {
            const cleanType = type.trim().toUpperCase();
            qb.andWhere('(c.category_type = :cleanType OR c.category_type = :allType)', {
                cleanType,
                allType: 'ALL',
            });
        }
        const rows = await qb.getMany();
        return rows.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            categoryType: r.category_type || 'ALL',
            category_type: r.category_type || 'ALL',
            description: r.description || '',
            enabled: r.enabled !== false,
            status: r.enabled !== false,
            companyId,
            created_at: r.created_at,
        }));
    }
    async createCategory(dto, companyId, userId) {
        const nextCode = dto.code?.trim() || (await this.generateNextCode(this.categoryRepo, companyId, 'CAT-'));
        const categoryType = (dto.category_type || dto.categoryType || 'ALL').trim().toUpperCase();
        const entity = this.categoryRepo.create({
            code: nextCode,
            name: dto.name.trim(),
            category_type: categoryType,
            description: dto.description || '',
            enabled: dto.enabled !== false,
            deleted: false,
            company: { id: companyId },
            created_by: userId,
        });
        const saved = await this.categoryRepo.save(entity);
        return {
            id: saved.id,
            code: saved.code,
            name: saved.name,
            categoryType: saved.category_type,
            category_type: saved.category_type,
            description: saved.description || '',
            enabled: saved.enabled !== false,
            status: saved.enabled !== false,
            companyId,
            created_at: saved.created_at,
        };
    }
    async updateCategory(id, companyId, dto) {
        const existing = await this.categoryRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
        });
        if (!existing)
            throw new common_1.NotFoundException('Categoría no encontrada');
        if (dto.code)
            existing.code = dto.code.trim();
        if (dto.name)
            existing.name = dto.name.trim();
        const catType = dto.category_type || dto.categoryType;
        if (catType)
            existing.category_type = catType.trim().toUpperCase();
        if (dto.description !== undefined)
            existing.description = dto.description;
        if (dto.enabled !== undefined)
            existing.enabled = dto.enabled;
        const saved = await this.categoryRepo.save(existing);
        return {
            id: saved.id,
            code: saved.code,
            name: saved.name,
            categoryType: saved.category_type,
            category_type: saved.category_type,
            description: saved.description || '',
            enabled: saved.enabled !== false,
            status: saved.enabled !== false,
            companyId,
            created_at: saved.created_at,
        };
    }
    async deleteCategory(id, companyId) {
        const inUseUnified = await this.unifiedItemRepo.count({
            where: { product_category_id: id, company: { id: companyId }, deleted: false },
        });
        const inUseLegacy = await this.itemRepo.count({
            where: { category_id: id, company: { id: companyId }, deleted: false },
        });
        if (inUseUnified > 0 || inUseLegacy > 0) {
            throw new common_1.BadRequestException('No se puede eliminar la categoría porque está asociada a uno o más artículos.');
        }
        await this.categoryRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
        return { deleted: true, id };
    }
    async listWarehouses(companyId) {
        const rows = await this.warehouseRepo.find({
            where: { company: { id: companyId }, deleted: false },
            order: { is_default: 'DESC', name: 'ASC' },
        });
        return rows.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            address: r.address || '',
            responsible: r.responsible || '',
            phone: r.phone || '',
            branchId: r.branch_id,
            branch_id: r.branch_id,
            isDefault: Boolean(r.is_default),
            is_default: Boolean(r.is_default),
            enabled: r.enabled !== false,
            status: r.enabled !== false,
            companyId,
            created_at: r.created_at,
        }));
    }
    async createWarehouse(dto, companyId, userId) {
        return await this.dataSource.transaction(async (manager) => {
            const nextCode = dto.code?.trim() || (await this.generateNextCode(this.warehouseRepo, companyId, 'BOD-'));
            const isDefault = dto.is_default ?? dto.isDefault ?? false;
            if (isDefault) {
                await manager.update(inventory_orm_entity_1.InventoryWarehouseOrmEntity, { company: { id: companyId } }, { is_default: false });
            }
            const entity = manager.create(inventory_orm_entity_1.InventoryWarehouseOrmEntity, {
                code: nextCode,
                name: dto.name.trim(),
                address: dto.address || '',
                responsible: dto.responsible || '',
                phone: dto.phone || '',
                branch_id: dto.branch_id ?? dto.branchId,
                is_default: isDefault,
                enabled: dto.enabled !== false,
                deleted: false,
                company: { id: companyId },
                created_by: userId,
            });
            const saved = await manager.save(inventory_orm_entity_1.InventoryWarehouseOrmEntity, entity);
            return {
                id: saved.id,
                code: saved.code,
                name: saved.name,
                address: saved.address || '',
                responsible: saved.responsible || '',
                phone: saved.phone || '',
                branchId: saved.branch_id,
                branch_id: saved.branch_id,
                isDefault: Boolean(saved.is_default),
                is_default: Boolean(saved.is_default),
                enabled: saved.enabled !== false,
                status: saved.enabled !== false,
                companyId,
                created_at: saved.created_at,
            };
        });
    }
    async updateWarehouse(id, companyId, dto) {
        return await this.dataSource.transaction(async (manager) => {
            const existing = await manager.findOne(inventory_orm_entity_1.InventoryWarehouseOrmEntity, {
                where: { id, company: { id: companyId }, deleted: false },
            });
            if (!existing)
                throw new common_1.NotFoundException('Bodega no encontrada');
            const isDefault = dto.is_default ?? dto.isDefault;
            if (isDefault) {
                await manager.update(inventory_orm_entity_1.InventoryWarehouseOrmEntity, { company: { id: companyId } }, { is_default: false });
                existing.is_default = true;
            }
            else if (isDefault !== undefined) {
                existing.is_default = false;
            }
            if (dto.code)
                existing.code = dto.code.trim();
            if (dto.name)
                existing.name = dto.name.trim();
            if (dto.address !== undefined)
                existing.address = dto.address;
            if (dto.responsible !== undefined)
                existing.responsible = dto.responsible;
            if (dto.phone !== undefined)
                existing.phone = dto.phone;
            const branchId = dto.branch_id ?? dto.branchId;
            if (branchId !== undefined)
                existing.branch_id = branchId;
            if (dto.enabled !== undefined)
                existing.enabled = dto.enabled;
            const saved = await manager.save(inventory_orm_entity_1.InventoryWarehouseOrmEntity, existing);
            return {
                id: saved.id,
                code: saved.code,
                name: saved.name,
                address: saved.address || '',
                responsible: saved.responsible || '',
                phone: saved.phone || '',
                branchId: saved.branch_id,
                branch_id: saved.branch_id,
                isDefault: Boolean(saved.is_default),
                is_default: Boolean(saved.is_default),
                enabled: saved.enabled !== false,
                status: saved.enabled !== false,
                companyId,
                created_at: saved.created_at,
            };
        });
    }
    async deleteWarehouse(id, companyId) {
        const movementsCount = await this.movementRepo.count({
            where: { warehouse: { id }, company: { id: companyId } },
        });
        if (movementsCount > 0) {
            throw new common_1.BadRequestException('No se puede eliminar la bodega porque tiene movimientos históricos registrados. Puedes desactivarla.');
        }
        await this.warehouseRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
        return { deleted: true, id };
    }
    calculateAverageCost(currentStock, currentAvgCost, entryQty, entryUnitCost) {
        const newStock = currentStock.plus(entryQty);
        if (newStock.lessThanOrEqualTo(0)) {
            return entryUnitCost;
        }
        const currentTotal = currentStock.times(currentAvgCost);
        const entryTotal = entryQty.times(entryUnitCost);
        return currentTotal.plus(entryTotal).dividedBy(newStock);
    }
    async registerEntry(params, externalManager) {
        const run = async (manager) => {
            if (params.idempotencyKey) {
                const existing = await manager.findOne(inventory_orm_entity_1.InventoryMovementOrmEntity, {
                    where: { idempotency_key: params.idempotencyKey, company: { id: params.companyId } },
                });
                if (existing)
                    return existing;
            }
            const product = await manager.findOne(inventory_orm_entity_1.ItemOrmEntity, {
                where: { id: params.productId, company: { id: params.companyId }, deleted: false },
            });
            if (!product) {
                throw new common_1.NotFoundException(`El concepto ID ${params.productId} no existe en la empresa.`);
            }
            if (product.item_type !== 'PRODUCT') {
                throw new common_1.BadRequestException(`El concepto "${product.name}" es de tipo ${product.item_type} y no controla inventario físico.`);
            }
            const warehouse = await manager.findOne(inventory_orm_entity_1.InventoryWarehouseOrmEntity, {
                where: { id: params.warehouseId, company: { id: params.companyId }, deleted: false },
            });
            if (!warehouse) {
                throw new common_1.NotFoundException(`La bodega ID ${params.warehouseId} no existe en la empresa.`);
            }
            if (!warehouse.enabled) {
                throw new common_1.BadRequestException(`La bodega "${warehouse.name}" está inactiva y no admite operaciones.`);
            }
            const entryQty = new decimal_js_1.default(params.quantity);
            if (entryQty.lessThanOrEqualTo(0)) {
                throw new common_1.BadRequestException('La cantidad de entrada debe ser mayor a cero.');
            }
            const entryUnitCost = new decimal_js_1.default(params.unitCost != null ? params.unitCost : Number(product.purchase_price || 0));
            let balance = await manager
                .createQueryBuilder(inventory_orm_entity_1.InventoryBalanceOrmEntity, 'b')
                .setLock('pessimistic_write')
                .where('b.company_id = :companyId AND b.warehouse_id = :warehouseId AND b.product_id = :productId', {
                companyId: params.companyId,
                warehouseId: params.warehouseId,
                productId: params.productId,
            })
                .getOne();
            if (!balance) {
                balance = manager.create(inventory_orm_entity_1.InventoryBalanceOrmEntity, {
                    company: { id: params.companyId },
                    warehouse: { id: params.warehouseId },
                    product: { id: params.productId },
                    stock: 0,
                    reserved_stock: 0,
                    average_cost: 0,
                });
            }
            const currentStock = new decimal_js_1.default(balance.stock || 0);
            const currentAvgCost = new decimal_js_1.default(balance.average_cost || 0);
            const newStock = currentStock.plus(entryQty);
            const newAvgCost = this.calculateAverageCost(currentStock, currentAvgCost, entryQty, entryUnitCost);
            balance.stock = newStock.toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber();
            balance.average_cost = newAvgCost.toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber();
            await manager.save(inventory_orm_entity_1.InventoryBalanceOrmEntity, balance);
            const movement = manager.create(inventory_orm_entity_1.InventoryMovementOrmEntity, {
                company: { id: params.companyId },
                warehouse: { id: params.warehouseId },
                product: { id: params.productId },
                product_code: product.code,
                product_name: product.name,
                movement_type: 'IN',
                movement_reason: params.movementReason,
                quantity: entryQty.toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber(),
                unit_cost: entryUnitCost.toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber(),
                total_cost: entryQty.times(entryUnitCost).toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber(),
                stock_after: balance.stock,
                collection_origin_id: params.collectionOriginId,
                collection_origin_name: params.collectionOriginName,
                collection_origin_document: params.collectionOriginDocument,
                movement_group_id: params.movementGroupId,
                idempotency_key: params.idempotencyKey,
                reversal_of_movement_id: params.reversalOfMovementId,
                created_user_id: params.createdUserId,
            });
            return await manager.save(inventory_orm_entity_1.InventoryMovementOrmEntity, movement);
        };
        if (externalManager) {
            return await run(externalManager);
        }
        return await this.dataSource.transaction(run);
    }
    async registerExit(params, externalManager) {
        const run = async (manager) => {
            if (params.idempotencyKey) {
                const existing = await manager.findOne(inventory_orm_entity_1.InventoryMovementOrmEntity, {
                    where: { idempotency_key: params.idempotencyKey, company: { id: params.companyId } },
                });
                if (existing)
                    return existing;
            }
            const product = await manager.findOne(inventory_orm_entity_1.ItemOrmEntity, {
                where: { id: params.productId, company: { id: params.companyId }, deleted: false },
            });
            if (!product) {
                throw new common_1.NotFoundException(`El concepto ID ${params.productId} no existe en la empresa.`);
            }
            if (product.item_type !== 'PRODUCT') {
                throw new common_1.BadRequestException(`El concepto "${product.name}" es de tipo ${product.item_type} y no controla inventario.`);
            }
            const warehouse = await manager.findOne(inventory_orm_entity_1.InventoryWarehouseOrmEntity, {
                where: { id: params.warehouseId, company: { id: params.companyId }, deleted: false },
            });
            if (!warehouse) {
                throw new common_1.NotFoundException(`La bodega ID ${params.warehouseId} no existe en la empresa.`);
            }
            if (!warehouse.enabled) {
                throw new common_1.BadRequestException(`La bodega "${warehouse.name}" está inactiva y no admite operaciones.`);
            }
            const exitQty = new decimal_js_1.default(Math.abs(params.quantity));
            if (exitQty.lessThanOrEqualTo(0)) {
                throw new common_1.BadRequestException('La cantidad de salida debe ser mayor a cero.');
            }
            const balance = await manager
                .createQueryBuilder(inventory_orm_entity_1.InventoryBalanceOrmEntity, 'b')
                .setLock('pessimistic_write')
                .where('b.company_id = :companyId AND b.warehouse_id = :warehouseId AND b.product_id = :productId', {
                companyId: params.companyId,
                warehouseId: params.warehouseId,
                productId: params.productId,
            })
                .getOne();
            const currentStock = new decimal_js_1.default(balance?.stock || 0);
            const reservedStock = new decimal_js_1.default(balance?.reserved_stock || 0);
            const availableStock = currentStock.minus(reservedStock);
            if (availableStock.lessThan(exitQty)) {
                throw new common_1.BadRequestException(`Stock insuficiente para "${product.name}" (${product.code}) en la bodega "${warehouse.name}". Disponible: ${availableStock.toFixed(2)}, Requerido: ${exitQty.toFixed(2)}`);
            }
            const newStock = currentStock.minus(exitQty);
            if (newStock.isNegative()) {
                throw new common_1.BadRequestException('La operación generaría un stock negativo en bodega, lo cual está prohibido.');
            }
            const costToUse = params.unitCost != null
                ? new decimal_js_1.default(params.unitCost)
                : new decimal_js_1.default(balance?.average_cost || 0);
            if (balance) {
                balance.stock = newStock.toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber();
                await manager.save(inventory_orm_entity_1.InventoryBalanceOrmEntity, balance);
            }
            const movement = manager.create(inventory_orm_entity_1.InventoryMovementOrmEntity, {
                company: { id: params.companyId },
                warehouse: { id: params.warehouseId },
                product: { id: params.productId },
                product_code: product.code,
                product_name: product.name,
                movement_type: 'OUT',
                movement_reason: params.movementReason,
                quantity: exitQty.negated().toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber(),
                unit_cost: costToUse.toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber(),
                total_cost: exitQty.times(costToUse).toDecimalPlaces(6, decimal_js_1.default.ROUND_HALF_UP).toNumber(),
                stock_after: balance ? balance.stock : 0,
                collection_origin_id: params.collectionOriginId,
                collection_origin_name: params.collectionOriginName,
                collection_origin_document: params.collectionOriginDocument,
                movement_group_id: params.movementGroupId,
                idempotency_key: params.idempotencyKey,
                reversal_of_movement_id: params.reversalOfMovementId,
                created_user_id: params.createdUserId,
            });
            return await manager.save(inventory_orm_entity_1.InventoryMovementOrmEntity, movement);
        };
        if (externalManager) {
            return await run(externalManager);
        }
        return await this.dataSource.transaction(run);
    }
    async registerTransfer(params, externalManager) {
        const run = async (manager) => {
            if (params.from_warehouse_id === params.to_warehouse_id) {
                throw new common_1.BadRequestException('La bodega de origen y de destino no pueden ser la misma.');
            }
            const movementGroupId = (0, crypto_1.randomUUID)();
            const fromBalance = await manager.findOne(inventory_orm_entity_1.InventoryBalanceOrmEntity, {
                where: {
                    company: { id: params.companyId },
                    warehouse: { id: params.from_warehouse_id },
                    product: { id: params.product_id },
                },
            });
            const costOrigin = fromBalance?.average_cost || 0;
            const exitMovement = await this.registerExit({
                companyId: params.companyId,
                warehouseId: params.from_warehouse_id,
                productId: params.product_id,
                quantity: params.quantity,
                unitCost: costOrigin,
                movementReason: 'TRANSFER',
                collectionOriginName: 'TRANSFER_OUT',
                collectionOriginDocument: params.notes || 'Transferencia entre bodegas',
                movementGroupId,
                createdUserId: params.created_user_id,
            }, manager);
            const entryMovement = await this.registerEntry({
                companyId: params.companyId,
                warehouseId: params.to_warehouse_id,
                productId: params.product_id,
                quantity: params.quantity,
                unitCost: costOrigin,
                movementReason: 'TRANSFER',
                collectionOriginName: 'TRANSFER_IN',
                collectionOriginDocument: params.notes || 'Transferencia entre bodegas',
                movementGroupId,
                createdUserId: params.created_user_id,
            }, manager);
            return { movementGroupId, exitMovement, entryMovement };
        };
        if (externalManager) {
            return await run(externalManager);
        }
        return await this.dataSource.transaction(run);
    }
    async createAdjustment(params, externalManager) {
        const run = async (manager) => {
            const balance = await manager
                .createQueryBuilder(inventory_orm_entity_1.InventoryBalanceOrmEntity, 'b')
                .setLock('pessimistic_write')
                .where('b.company_id = :companyId AND b.warehouse_id = :warehouseId AND b.product_id = :productId', {
                companyId: params.companyId,
                warehouseId: params.warehouse_id,
                productId: params.product_id,
            })
                .getOne();
            const currentStock = new decimal_js_1.default(balance?.stock || 0);
            const targetStock = new decimal_js_1.default(params.new_stock);
            if (targetStock.isNegative()) {
                throw new common_1.BadRequestException('El nuevo stock no puede ser negativo.');
            }
            const difference = targetStock.minus(currentStock);
            if (difference.isZero()) {
                return { balance: balance };
            }
            let movement;
            if (difference.isPositive()) {
                movement = await this.registerEntry({
                    companyId: params.companyId,
                    warehouseId: params.warehouse_id,
                    productId: params.product_id,
                    quantity: difference.toNumber(),
                    unitCost: params.unit_cost != null ? params.unit_cost : (balance?.average_cost || 0),
                    movementReason: 'ADJUSTMENT',
                    collectionOriginName: 'PHYSICAL_ADJUSTMENT',
                    collectionOriginDocument: params.reason,
                    createdUserId: params.created_user_id,
                }, manager);
            }
            else {
                movement = await this.registerExit({
                    companyId: params.companyId,
                    warehouseId: params.warehouse_id,
                    productId: params.product_id,
                    quantity: difference.abs().toNumber(),
                    unitCost: balance?.average_cost || 0,
                    movementReason: 'ADJUSTMENT',
                    collectionOriginName: 'PHYSICAL_ADJUSTMENT',
                    collectionOriginDocument: params.reason,
                    createdUserId: params.created_user_id,
                }, manager);
            }
            const updatedBalance = await manager.findOne(inventory_orm_entity_1.InventoryBalanceOrmEntity, {
                where: {
                    company: { id: params.companyId },
                    warehouse: { id: params.warehouse_id },
                    product: { id: params.product_id },
                },
            });
            return { balance: updatedBalance, movement };
        };
        if (externalManager) {
            return await run(externalManager);
        }
        return await this.dataSource.transaction(run);
    }
    async reverseMovement(movementId, companyId, reason = 'REVERSAL', externalManager) {
        const run = async (manager) => {
            const orig = await manager.findOne(inventory_orm_entity_1.InventoryMovementOrmEntity, {
                where: { id: movementId, company: { id: companyId } },
                relations: ['product', 'warehouse'],
            });
            if (!orig)
                throw new common_1.NotFoundException('Movimiento original no encontrado.');
            const alreadyReversed = await manager.findOne(inventory_orm_entity_1.InventoryMovementOrmEntity, {
                where: { reversal_of_movement_id: movementId, company: { id: companyId } },
            });
            if (alreadyReversed) {
                throw new common_1.BadRequestException(`Este movimiento ya fue revertido en el movimiento #${alreadyReversed.id}.`);
            }
            const qty = Math.abs(Number(orig.quantity));
            if (orig.movement_type === 'IN') {
                return await this.registerExit({
                    companyId,
                    warehouseId: orig.warehouse.id,
                    productId: orig.product.id,
                    quantity: qty,
                    unitCost: Number(orig.unit_cost),
                    movementReason: 'REVERSAL',
                    collectionOriginName: 'REVERSAL_OF_IN',
                    collectionOriginDocument: `Anulación mov #${orig.id}: ${orig.collection_origin_document || ''}`,
                    reversalOfMovementId: orig.id,
                }, manager);
            }
            else {
                return await this.registerEntry({
                    companyId,
                    warehouseId: orig.warehouse.id,
                    productId: orig.product.id,
                    quantity: qty,
                    unitCost: Number(orig.unit_cost),
                    movementReason: 'REVERSAL',
                    collectionOriginName: 'REVERSAL_OF_OUT',
                    collectionOriginDocument: `Anulación mov #${orig.id}: ${orig.collection_origin_document || ''}`,
                    reversalOfMovementId: orig.id,
                }, manager);
            }
        };
        if (externalManager) {
            return await run(externalManager);
        }
        return await this.dataSource.transaction(run);
    }
    async getStock(companyId, productId) {
        const balances = await this.balanceRepo.find({
            where: { company: { id: companyId }, product: { id: productId } },
            relations: ['warehouse'],
        });
        let totalStock = new decimal_js_1.default(0);
        let totalReserved = new decimal_js_1.default(0);
        const warehouses = balances.map((b) => {
            const s = new decimal_js_1.default(b.stock || 0);
            const r = new decimal_js_1.default(b.reserved_stock || 0);
            totalStock = totalStock.plus(s);
            totalReserved = totalReserved.plus(r);
            return {
                warehouseId: b.warehouse.id,
                warehouseCode: b.warehouse.code,
                warehouseName: b.warehouse.name,
                isDefault: b.warehouse.is_default,
                stock: s.toNumber(),
                reservedStock: r.toNumber(),
                availableStock: s.minus(r).toNumber(),
                averageCost: Number(b.average_cost || 0),
            };
        });
        return {
            productId,
            totalStock: totalStock.toNumber(),
            totalReserved: totalReserved.toNumber(),
            availableStock: totalStock.minus(totalReserved).toNumber(),
            warehouses,
        };
    }
    async getStockByWarehouse(companyId, warehouseId, productId) {
        const qb = this.balanceRepo
            .createQueryBuilder('b')
            .innerJoinAndSelect('b.warehouse', 'w')
            .innerJoinAndSelect('b.product', 'p')
            .where('b.company_id = :companyId AND b.warehouse_id = :warehouseId', { companyId, warehouseId });
        if (productId) {
            qb.andWhere('b.product_id = :productId', { productId });
        }
        const rows = await qb.getMany();
        return rows.map((b) => {
            const s = Number(b.stock || 0);
            const r = Number(b.reserved_stock || 0);
            return {
                id: b.id,
                productId: b.product.id,
                productCode: b.product.code,
                productName: b.product.name,
                itemType: b.product.item_type,
                warehouseId: b.warehouse.id,
                warehouseName: b.warehouse.name,
                stock: s,
                reservedStock: r,
                availableStock: Math.max(0, s - r),
                averageCost: Number(b.average_cost || 0),
                updated_at: b.updated_at,
            };
        });
    }
    async getKardex(companyId, productId, warehouseId, fromDate, toDate) {
        const qb = this.movementRepo
            .createQueryBuilder('m')
            .innerJoinAndSelect('m.warehouse', 'w')
            .innerJoinAndSelect('m.product', 'p')
            .where('m.company_id = :companyId AND m.product_id = :productId', { companyId, productId })
            .orderBy('m.movement_at', 'ASC')
            .addOrderBy('m.id', 'ASC');
        if (warehouseId) {
            qb.andWhere('m.warehouse_id = :warehouseId', { warehouseId });
        }
        if (fromDate) {
            qb.andWhere('m.movement_at >= :fromDate', { fromDate });
        }
        if (toDate) {
            qb.andWhere('m.movement_at <= :toDate', { toDate });
        }
        const rows = await qb.getMany();
        return rows.map((m) => ({
            id: m.id,
            date: m.movement_at,
            warehouseId: m.warehouse.id,
            warehouseName: m.warehouse.name,
            productId: m.product.id,
            productCode: m.product_code,
            productName: m.product_name,
            type: m.movement_type,
            reason: m.movement_reason,
            quantity: Number(m.quantity),
            unitCost: Number(m.unit_cost),
            totalCost: Number(m.total_cost),
            stockAfter: Number(m.stock_after),
            originDocument: m.collection_origin_document,
            originName: m.collection_origin_name,
            groupId: m.movement_group_id,
            reversalOfId: m.reversal_of_movement_id,
        }));
    }
    async reconcileStock(companyId, warehouseId, productId) {
        const sumResult = await this.movementRepo
            .createQueryBuilder('m')
            .select('COALESCE(SUM(m.quantity), 0)', 'total')
            .where('m.company_id = :companyId AND m.warehouse_id = :warehouseId AND m.product_id = :productId', {
            companyId,
            warehouseId,
            productId,
        })
            .getRawOne();
        const historicalStock = Number(sumResult?.total || 0);
        const balance = await this.balanceRepo.findOne({
            where: { company: { id: companyId }, warehouse: { id: warehouseId }, product: { id: productId } },
        });
        const currentBalanceStock = Number(balance?.stock || 0);
        const difference = Number((currentBalanceStock - historicalStock).toFixed(6));
        return {
            companyId,
            warehouseId,
            productId,
            currentBalanceStock,
            historicalStock,
            difference,
            isBalanced: Math.abs(difference) < 0.000001,
        };
    }
    async listUnifiedItems(companyId, filters) {
        const qb = this.unifiedItemRepo
            .createQueryBuilder('i')
            .leftJoinAndSelect('i.category', 'c')
            .where('i.company_id = :companyId AND i.deleted = false', { companyId })
            .orderBy('i.id', 'DESC');
        if (filters?.type && filters.type.trim()) {
            qb.andWhere('i.item_type = :type', { type: filters.type.trim().toUpperCase() });
        }
        if (filters?.categoryId) {
            qb.andWhere('i.product_category_id = :catId', { catId: filters.categoryId });
        }
        if (filters?.status !== undefined) {
            qb.andWhere('i.ind_active = :status', { status: filters.status });
        }
        if (filters?.search && filters.search.trim()) {
            const q = `%${filters.search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(i.code) LIKE :q OR LOWER(i.name) LIKE :q OR LOWER(i.sku) LIKE :q)', { q });
        }
        const items = await qb.getMany();
        const productIds = items.filter((i) => i.item_type === 'PRODUCT').map((i) => i.id);
        let balancesMap = {};
        if (productIds.length > 0) {
            const balances = await this.balanceRepo
                .createQueryBuilder('b')
                .select('b.product_id', 'productId')
                .addSelect('COALESCE(SUM(b.stock), 0)', 'totalStock')
                .addSelect('COALESCE(SUM(b.reserved_stock), 0)', 'totalReserved')
                .where('b.company_id = :companyId AND b.product_id IN (:...productIds)', { companyId, productIds })
                .groupBy('b.product_id')
                .getRawMany();
            balances.forEach((row) => {
                balancesMap[Number(row.productId)] = {
                    totalStock: Number(row.totalStock),
                    totalReserved: Number(row.totalReserved),
                };
            });
        }
        return items.map((i) => {
            const bal = balancesMap[i.id] || { totalStock: 0, totalReserved: 0 };
            return {
                id: i.id,
                companyId,
                code: i.code,
                sku: i.sku || '',
                name: i.name,
                description: i.description || '',
                itemType: i.item_type,
                item_type: i.item_type,
                categoryId: i.product_category_id,
                product_category_id: i.product_category_id,
                categoryName: i.category?.name || i.category_name || 'Sin categoría',
                category: i.category?.name || i.category_name || 'Sin categoría',
                unitMeasure: i.unit_measure,
                unit_measure: i.unit_measure,
                unit: i.unit_measure,
                salePrice: Number(i.sale_price),
                sale_price: Number(i.sale_price),
                purchasePrice: Number(i.purchase_price),
                purchase_price: Number(i.purchase_price),
                taxRate: Number(i.tax_rate),
                tax_rate: Number(i.tax_rate),
                stockCurrent: bal.totalStock,
                stock_current: bal.totalStock,
                reservedStock: bal.totalReserved,
                availableStock: Math.max(0, bal.totalStock - bal.totalReserved),
                indActive: i.ind_active,
                status: i.ind_active,
                enabled: i.ind_active,
                created_at: i.created_at,
            };
        });
    }
    async getUnifiedItemById(id, companyId) {
        const item = await this.unifiedItemRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
            relations: ['category'],
        });
        if (!item)
            throw new common_1.NotFoundException('Concepto no encontrado.');
        let stockInfo = { totalStock: 0, totalReserved: 0, availableStock: 0, warehouses: [] };
        if (item.item_type === 'PRODUCT') {
            stockInfo = await this.getStock(companyId, id);
        }
        return {
            id: item.id,
            companyId,
            code: item.code,
            sku: item.sku || '',
            name: item.name,
            description: item.description || '',
            itemType: item.item_type,
            item_type: item.item_type,
            categoryId: item.product_category_id,
            product_category_id: item.product_category_id,
            categoryName: item.category?.name || item.category_name || '',
            unitMeasure: item.unit_measure,
            salePrice: Number(item.sale_price),
            purchasePrice: Number(item.purchase_price),
            taxRate: Number(item.tax_rate),
            indActive: item.ind_active,
            status: item.ind_active,
            stockInfo,
            created_at: item.created_at,
        };
    }
    async createUnifiedItem(dto, userId) {
        return await this.dataSource.transaction(async (manager) => {
            const companyId = dto.companyId || 1;
            const itemType = (dto.item_type || 'PRODUCT').trim().toUpperCase();
            let prefix = 'ART-';
            if (itemType === 'SERVICE')
                prefix = 'SRV-';
            if (itemType === 'LABOR')
                prefix = 'MO-';
            const code = dto.code?.trim() || (await this.generateNextCode(this.unifiedItemRepo, companyId, prefix));
            const catId = dto.product_category_id ?? dto.productCategoryId;
            let categoryEntity = null;
            let categoryName = dto.category_name || '';
            if (catId) {
                categoryEntity = await manager.findOne(inventory_orm_entity_1.InventoryCategoryOrmEntity, {
                    where: { id: catId, company: { id: companyId }, deleted: false },
                });
                if (categoryEntity) {
                    categoryName = categoryEntity.name;
                }
            }
            const entity = manager.create(inventory_orm_entity_1.ItemOrmEntity, {
                company: { id: companyId },
                code,
                sku: dto.sku || '',
                name: dto.name.trim(),
                description: dto.description || '',
                item_type: itemType,
                category: categoryEntity || undefined,
                product_category_id: categoryEntity?.id || undefined,
                category_name: categoryName,
                unit_measure: dto.unit_measure || (itemType === 'SERVICE' ? 'SERV' : itemType === 'LABOR' ? 'HORA' : 'UND'),
                sale_price: Number(dto.sale_price || 0),
                purchase_price: Number(dto.purchase_price || 0),
                tax_rate: Number(dto.tax_rate ?? 15),
                ind_active: dto.ind_active !== false,
                deleted: false,
            });
            const saved = await manager.save(inventory_orm_entity_1.ItemOrmEntity, entity);
            const initialStock = Number(dto.initial_stock || 0);
            const warehouseId = dto.warehouse_id;
            if (itemType === 'PRODUCT' && initialStock > 0 && warehouseId) {
                await this.registerEntry({
                    companyId,
                    warehouseId,
                    productId: saved.id,
                    quantity: initialStock,
                    unitCost: Number(dto.purchase_price || 0),
                    movementReason: 'OPENING',
                    collectionOriginName: 'INITIAL_STOCK',
                    collectionOriginDocument: `Apertura inicial ítem ${saved.code}`,
                    createdUserId: userId,
                }, manager);
            }
            return saved;
        });
    }
    async updateUnifiedItem(id, companyId, dto) {
        return await this.dataSource.transaction(async (manager) => {
            const existing = await manager.findOne(inventory_orm_entity_1.ItemOrmEntity, {
                where: { id, company: { id: companyId }, deleted: false },
                relations: ['category'],
            });
            if (!existing)
                throw new common_1.NotFoundException('Concepto no encontrado.');
            if (dto.code)
                existing.code = dto.code.trim();
            if (dto.sku !== undefined)
                existing.sku = dto.sku;
            if (dto.name)
                existing.name = dto.name.trim();
            if (dto.description !== undefined)
                existing.description = dto.description;
            if (dto.item_type)
                existing.item_type = dto.item_type.trim().toUpperCase();
            const catId = dto.product_category_id ?? dto.productCategoryId;
            if (catId !== undefined) {
                if (catId) {
                    const cat = await manager.findOne(inventory_orm_entity_1.InventoryCategoryOrmEntity, {
                        where: { id: catId, company: { id: companyId }, deleted: false },
                    });
                    if (cat) {
                        existing.category = cat;
                        existing.product_category_id = cat.id;
                        existing.category_name = cat.name;
                    }
                }
                else {
                    existing.category = null;
                    existing.product_category_id = null;
                    existing.category_name = '';
                }
            }
            if (dto.unit_measure)
                existing.unit_measure = dto.unit_measure;
            if (dto.sale_price !== undefined)
                existing.sale_price = Number(dto.sale_price);
            if (dto.purchase_price !== undefined)
                existing.purchase_price = Number(dto.purchase_price);
            if (dto.tax_rate !== undefined)
                existing.tax_rate = Number(dto.tax_rate);
            if (dto.ind_active !== undefined)
                existing.ind_active = dto.ind_active;
            return await manager.save(inventory_orm_entity_1.ItemOrmEntity, existing);
        });
    }
    async deleteUnifiedItem(id, companyId) {
        const item = await this.unifiedItemRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
        });
        if (!item)
            throw new common_1.NotFoundException('Concepto no encontrado.');
        const movementsCount = await this.movementRepo.count({
            where: { product: { id }, company: { id: companyId } },
        });
        if (movementsCount > 0) {
            item.ind_active = false;
            await this.unifiedItemRepo.save(item);
            return { deleted: false, deactivated: true, message: 'El artículo tiene movimientos históricos registrados; se ha desactivado.' };
        }
        item.deleted = true;
        item.ind_active = false;
        await this.unifiedItemRepo.save(item);
        return { deleted: true, id };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryItemOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryServiceOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventorySubcontractOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryCategoryOrmEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryWarehouseOrmEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.ItemOrmEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryBalanceOrmEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryMovementOrmEntity)),
    __param(8, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map