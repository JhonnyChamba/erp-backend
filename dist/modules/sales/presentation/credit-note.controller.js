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
exports.CreditNoteController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const credit_note_service_1 = require("../application/credit-note.service");
const create_credit_note_dto_1 = require("../application/dto/create-credit-note.dto");
let CreditNoteController = class CreditNoteController {
    creditNoteService;
    constructor(creditNoteService) {
        this.creditNoteService = creditNoteService;
    }
    resolveCompanyId(req, explicitId) {
        const headerVal = req?.headers?.['x-company-id'];
        const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
        return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
    }
    create(dto, req) {
        const companyId = this.resolveCompanyId(req);
        return this.creditNoteService.create(dto, companyId, req.user?.user_id);
    }
    findAll(companyIdQuery, branchIdQuery, invoiceIdQuery, search, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const branchId = Number(branchIdQuery);
        const invoiceId = Number(invoiceIdQuery);
        return this.creditNoteService.list(companyId, {
            branchId: Number.isInteger(branchId) && branchId > 0 ? branchId : undefined,
            invoiceId: Number.isInteger(invoiceId) && invoiceId > 0 ? invoiceId : undefined,
            search,
        });
    }
    getNextSequential(branchIdQuery, emissionPointQuery, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const branchId = Number(branchIdQuery) || 1;
        const emissionPoint = emissionPointQuery || '001';
        return this.creditNoteService.getNextSequentialPreview(companyId, branchId, emissionPoint);
    }
    findOne(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.creditNoteService.findById(Number(id), companyId);
    }
    sendToSri(id, companyIdQuery, req) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        return this.creditNoteService.sendToSri(Number(id), companyId);
    }
    async downloadXml(id, companyIdQuery, req, res) {
        const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
        const xml = await this.creditNoteService.getSignedXml(Number(id), companyId);
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename=NotaCredito_${id}.xml`);
        return res.send(xml);
    }
};
exports.CreditNoteController = CreditNoteController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_credit_note_dto_1.CreateCreditNoteDto, Object]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('invoiceId')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-sequential'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('emissionPoint')),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "getNextSequential", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/send-sri'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], CreditNoteController.prototype, "sendToSri", null);
__decorate([
    (0, common_1.Get)(':id/xml'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object, Object]),
    __metadata("design:returntype", Promise)
], CreditNoteController.prototype, "downloadXml", null);
exports.CreditNoteController = CreditNoteController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('sales/credit-notes'),
    __metadata("design:paramtypes", [credit_note_service_1.CreditNoteService])
], CreditNoteController);
//# sourceMappingURL=credit-note.controller.js.map