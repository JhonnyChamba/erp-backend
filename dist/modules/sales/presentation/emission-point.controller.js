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
exports.EmissionPointController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const emission_point_service_1 = require("../application/emission-point.service");
const emission_point_dto_1 = require("../application/dto/emission-point.dto");
let EmissionPointController = class EmissionPointController {
    emissionPointService;
    constructor(emissionPointService) {
        this.emissionPointService = emissionPointService;
    }
    resolveCompanyId(req, explicitId) {
        const headerVal = req?.headers?.['x-company-id'];
        const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
        return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
    }
    findAll(branchIdQuery, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const branchId = branchIdQuery ? Number(branchIdQuery) : undefined;
        return this.emissionPointService.listEmissionPoints(companyId, branchId);
    }
    getNextSequential(branchIdQuery, emissionPointIdQuery, serieQuery, documentTypeQuery, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const branchId = Number(branchIdQuery);
        const emissionPointId = emissionPointIdQuery ? Number(emissionPointIdQuery) : undefined;
        const documentType = documentTypeQuery || 'FACTURAS';
        return this.emissionPointService.getNextSequential(companyId, branchId, emissionPointId, serieQuery, documentType);
    }
    findOne(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.emissionPointService.getEmissionPointById(Number(id), companyId);
    }
    create(dto, req) {
        const explicit = dto?.companyId || dto?.company_id;
        const companyId = this.resolveCompanyId(req, explicit);
        return this.emissionPointService.createEmissionPoint(companyId, dto, req.user?.user_id);
    }
    update(id, dto, req) {
        const explicit = dto?.companyId || dto?.company_id;
        const companyId = this.resolveCompanyId(req, explicit);
        return this.emissionPointService.updateEmissionPoint(Number(id), companyId, dto);
    }
    delete(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.emissionPointService.deleteEmissionPoint(Number(id), companyId);
    }
    updateSequence(sequenceId, dto, req) {
        const explicit = dto?.companyId || dto?.company_id;
        const companyId = this.resolveCompanyId(req, explicit);
        return this.emissionPointService.updateSequenceCorrelative(Number(sequenceId), companyId, dto);
    }
};
exports.EmissionPointController = EmissionPointController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], EmissionPointController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-sequential'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('emissionPointId')),
    __param(2, (0, common_1.Query)('serie')),
    __param(3, (0, common_1.Query)('documentType')),
    __param(4, (0, common_1.Query)('companyId')),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], EmissionPointController.prototype, "getNextSequential", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], EmissionPointController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [emission_point_dto_1.CreateEmissionPointDto, Object]),
    __metadata("design:returntype", void 0)
], EmissionPointController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, emission_point_dto_1.UpdateEmissionPointDto, Object]),
    __metadata("design:returntype", void 0)
], EmissionPointController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], EmissionPointController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)('sequences/:sequenceId'),
    __param(0, (0, common_1.Param)('sequenceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, emission_point_dto_1.UpdateSequenceDto, Object]),
    __metadata("design:returntype", void 0)
], EmissionPointController.prototype, "updateSequence", null);
exports.EmissionPointController = EmissionPointController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('sales/emission-points'),
    __metadata("design:paramtypes", [emission_point_service_1.EmissionPointService])
], EmissionPointController);
//# sourceMappingURL=emission-point.controller.js.map