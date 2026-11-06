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
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const inventory_service_1 = require("../application/inventory.service");
const inventory_dto_1 = require("../application/dto/inventory.dto");
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
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map