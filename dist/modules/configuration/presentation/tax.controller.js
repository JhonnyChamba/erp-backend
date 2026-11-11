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
exports.TaxController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const tax_service_1 = require("../application/tax.service");
const tax_dto_1 = require("../application/dto/tax.dto");
let TaxController = class TaxController {
    taxService;
    constructor(taxService) {
        this.taxService = taxService;
    }
    resolveCompanyId(req, explicitId) {
        const headerVal = req?.headers?.['x-company-id'];
        const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
        return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
    }
    list(companyIdQuery, activeQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const onlyActive = activeQuery === 'true' || activeQuery === '1';
        return this.taxService.list(companyId, onlyActive);
    }
    get(id, req) {
        const companyId = this.resolveCompanyId(req);
        return this.taxService.get(id, companyId);
    }
    create(dto, req) {
        const companyId = this.resolveCompanyId(req);
        return this.taxService.create(companyId, dto);
    }
    update(id, dto, req) {
        const companyId = this.resolveCompanyId(req);
        return this.taxService.update(id, companyId, dto);
    }
    toggleStatus(id, req) {
        const companyId = this.resolveCompanyId(req);
        return this.taxService.toggleStatus(id, companyId);
    }
    remove(id, req) {
        const companyId = this.resolveCompanyId(req);
        return this.taxService.remove(id, companyId);
    }
};
exports.TaxController = TaxController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('active')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TaxController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TaxController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tax_dto_1.CreateTaxDto, Object]),
    __metadata("design:returntype", void 0)
], TaxController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tax_dto_1.UpdateTaxDto, Object]),
    __metadata("design:returntype", void 0)
], TaxController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TaxController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TaxController.prototype, "remove", null);
exports.TaxController = TaxController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('taxes'),
    __metadata("design:paramtypes", [tax_service_1.TaxService])
], TaxController);
//# sourceMappingURL=tax.controller.js.map