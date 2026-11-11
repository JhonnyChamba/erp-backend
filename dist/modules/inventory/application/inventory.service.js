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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_orm_entity_1 = require("../infrastructure/persistence/inventory.orm-entity");
let InventoryService = class InventoryService {
    itemRepo;
    serviceRepo;
    subcontractRepo;
    categoryRepo;
    warehouseRepo;
    constructor(itemRepo, serviceRepo, subcontractRepo, categoryRepo, warehouseRepo) {
        this.itemRepo = itemRepo;
        this.serviceRepo = serviceRepo;
        this.subcontractRepo = subcontractRepo;
        this.categoryRepo = categoryRepo;
        this.warehouseRepo = warehouseRepo;
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
    async listCategories(companyId) {
        const rows = await this.categoryRepo.find({
            where: { company: { id: companyId }, deleted: false },
            order: { name: 'ASC' },
        });
        return rows.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            description: r.description || '',
            enabled: r.enabled !== false,
            status: r.enabled !== false,
            companyId,
            created_at: r.created_at,
        }));
    }
    async createCategory(dto, companyId, userId) {
        const nextCode = dto.code?.trim() || (await this.generateNextCode(this.categoryRepo, companyId, 'CAT-'));
        const entity = this.categoryRepo.create({
            code: nextCode,
            name: dto.name.trim(),
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
        if (dto.description !== undefined)
            existing.description = dto.description;
        if (dto.enabled !== undefined)
            existing.enabled = dto.enabled;
        const saved = await this.categoryRepo.save(existing);
        return {
            id: saved.id,
            code: saved.code,
            name: saved.name,
            description: saved.description || '',
            enabled: saved.enabled !== false,
            status: saved.enabled !== false,
            companyId,
            created_at: saved.created_at,
        };
    }
    async deleteCategory(id, companyId) {
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
        const nextCode = dto.code?.trim() || (await this.generateNextCode(this.warehouseRepo, companyId, 'BOD-'));
        const isDefault = dto.is_default ?? dto.isDefault ?? false;
        if (isDefault) {
            await this.warehouseRepo.update({ company: { id: companyId } }, { is_default: false });
        }
        const entity = this.warehouseRepo.create({
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
        const saved = await this.warehouseRepo.save(entity);
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
    }
    async updateWarehouse(id, companyId, dto) {
        const existing = await this.warehouseRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
        });
        if (!existing)
            throw new common_1.NotFoundException('Bodega no encontrada');
        const isDefault = dto.is_default ?? dto.isDefault;
        if (isDefault) {
            await this.warehouseRepo.update({ company: { id: companyId } }, { is_default: false });
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
        const saved = await this.warehouseRepo.save(existing);
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
    }
    async deleteWarehouse(id, companyId) {
        await this.warehouseRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map