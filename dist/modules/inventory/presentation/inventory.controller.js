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
exports.InventoryController = void 0;
const inventory_dto_1 = require("../application/dto/inventory.dto");
const common_1 = require("@nestjs/common");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const inventory_service_1 = require("../application/inventory.service");
const passport_1 = require("@nestjs/passport");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    resolveCompanyId(queryCompanyId, headerCompanyId, bodyCompanyId, req) {
        return Number(queryCompanyId || bodyCompanyId || headerCompanyId || req?.user?.company_id || 1);
    }
    listItems(queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.listItems(companyId);
    }
    createItem(dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.createItem(dto, companyId, req.user?.user_id);
    }
    updateItem(id, dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.updateItem(Number(id), companyId, dto);
    }
    deleteItem(id, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.deleteItem(Number(id), companyId);
    }
    listServices(queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.listServices(companyId);
    }
    createService(dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.createService(dto, companyId, req.user?.user_id);
    }
    updateService(id, dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.updateService(Number(id), companyId, dto);
    }
    deleteService(id, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.deleteService(Number(id), companyId);
    }
    listSubcontracts(queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.listSubcontracts(companyId);
    }
    createSubcontract(dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.createSubcontract(dto, companyId, req.user?.user_id);
    }
    updateSubcontract(id, dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.updateSubcontract(Number(id), companyId, dto);
    }
    deleteSubcontract(id, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.deleteSubcontract(Number(id), companyId);
    }
    listCategories(queryCompanyId, type, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.listCategories(companyId, type);
    }
    createCategory(dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.createCategory(dto, companyId, req.user?.user_id);
    }
    updateCategory(id, dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.updateCategory(Number(id), companyId, dto);
    }
    deleteCategory(id, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.deleteCategory(Number(id), companyId);
    }
    listWarehouses(queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.listWarehouses(companyId);
    }
    createWarehouse(dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.createWarehouse(dto, companyId, req.user?.user_id);
    }
    updateWarehouse(id, dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.updateWarehouse(Number(id), companyId, dto);
    }
    deleteWarehouse(id, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.deleteWarehouse(Number(id), companyId);
    }
    listUnifiedItems(queryCompanyId, type, categoryId, search, status, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        const parsedStatus = status === 'true' ? true : status === 'false' ? false : undefined;
        return this.inventoryService.listUnifiedItems(companyId, {
            type,
            categoryId: categoryId ? Number(categoryId) : undefined,
            search,
            status: parsedStatus,
        });
    }
    getUnifiedItem(id, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.getUnifiedItemById(Number(id), companyId);
    }
    createUnifiedItem(dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        dto.companyId = companyId;
        return this.inventoryService.createUnifiedItem(dto, req.user?.user_id);
    }
    updateUnifiedItem(id, dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        return this.inventoryService.updateUnifiedItem(Number(id), companyId, dto);
    }
    deleteUnifiedItem(id, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.deleteUnifiedItem(Number(id), companyId);
    }
    getStock(productId, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.getStock(companyId, Number(productId));
    }
    getStockByWarehouse(warehouseId, productId, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.getStockByWarehouse(companyId, Number(warehouseId), productId ? Number(productId) : undefined);
    }
    getKardex(productId, warehouseId, fromDate, toDate, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.getKardex(companyId, Number(productId), warehouseId ? Number(warehouseId) : undefined, fromDate, toDate);
    }
    reconcileStock(warehouseId, productId, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.reconcileStock(companyId, Number(warehouseId), Number(productId));
    }
    createTransfer(dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        dto.companyId = companyId;
        dto.created_user_id = req.user?.user_id;
        return this.inventoryService.registerTransfer(dto);
    }
    createAdjustment(dto, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
        dto.companyId = companyId;
        dto.created_user_id = req.user?.user_id;
        return this.inventoryService.createAdjustment(dto);
    }
    reverseMovement(id, reason, queryCompanyId, headerCompanyId, req) {
        const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
        return this.inventoryService.reverseMovement(Number(id), companyId, reason);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "listItems", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventoryItemDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateInventoryItemDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Get)('services'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "listServices", null);
__decorate([
    (0, common_1.Post)('services'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventoryServiceDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createService", null);
__decorate([
    (0, common_1.Patch)('services/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateInventoryServiceDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateService", null);
__decorate([
    (0, common_1.Delete)('services/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteService", null);
__decorate([
    (0, common_1.Get)('subcontracts'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "listSubcontracts", null);
__decorate([
    (0, common_1.Post)('subcontracts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventorySubcontractDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createSubcontract", null);
__decorate([
    (0, common_1.Patch)('subcontracts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateInventorySubcontractDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateSubcontract", null);
__decorate([
    (0, common_1.Delete)('subcontracts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteSubcontract", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventoryCategoryDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateInventoryCategoryDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('warehouses'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "listWarehouses", null);
__decorate([
    (0, common_1.Post)('warehouses'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventoryWarehouseDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createWarehouse", null);
__decorate([
    (0, common_1.Patch)('warehouses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateInventoryWarehouseDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateWarehouse", null);
__decorate([
    (0, common_1.Delete)('warehouses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteWarehouse", null);
__decorate([
    (0, common_1.Get)('unified-items'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "listUnifiedItems", null);
__decorate([
    (0, common_1.Get)('unified-items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getUnifiedItem", null);
__decorate([
    (0, common_1.Post)('unified-items'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateUnifiedItemDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createUnifiedItem", null);
__decorate([
    (0, common_1.Patch)('unified-items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateUnifiedItemDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateUnifiedItem", null);
__decorate([
    (0, common_1.Delete)('unified-items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteUnifiedItem", null);
__decorate([
    (0, common_1.Get)('stock/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getStock", null);
__decorate([
    (0, common_1.Get)('stock/warehouse/:warehouseId'),
    __param(0, (0, common_1.Param)('warehouseId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getStockByWarehouse", null);
__decorate([
    (0, common_1.Get)('kardex/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __param(4, (0, common_1.Query)('companyId')),
    __param(5, (0, common_1.Headers)('x-company-id')),
    __param(6, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getKardex", null);
__decorate([
    (0, common_1.Get)('reconcile'),
    __param(0, (0, common_1.Query)('warehouseId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "reconcileStock", null);
__decorate([
    (0, common_1.Post)('transfers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventoryTransferDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createTransfer", null);
__decorate([
    (0, common_1.Post)('adjustments'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateInventoryAdjustmentDto, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createAdjustment", null);
__decorate([
    (0, common_1.Post)('movements/:id/reverse'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "reverseMovement", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map