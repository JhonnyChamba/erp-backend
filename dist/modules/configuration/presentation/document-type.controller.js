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
exports.DocumentTypeController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const document_type_service_1 = require("../application/document-type.service");
const document_type_dto_1 = require("../application/dto/document-type.dto");
let DocumentTypeController = class DocumentTypeController {
    docTypeService;
    constructor(docTypeService) {
        this.docTypeService = docTypeService;
    }
    list(typeQuery, activeQuery) {
        const onlyActive = activeQuery === 'true' || activeQuery === '1';
        return this.docTypeService.list(typeQuery, onlyActive);
    }
    get(id) {
        return this.docTypeService.get(id);
    }
    create(dto) {
        return this.docTypeService.create(dto);
    }
    update(id, dto) {
        return this.docTypeService.update(id, dto);
    }
    toggleStatus(id) {
        return this.docTypeService.toggleStatus(id);
    }
    remove(id) {
        return this.docTypeService.remove(id);
    }
};
exports.DocumentTypeController = DocumentTypeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentTypeController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocumentTypeController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_type_dto_1.CreateDocumentTypeDto]),
    __metadata("design:returntype", void 0)
], DocumentTypeController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, document_type_dto_1.UpdateDocumentTypeDto]),
    __metadata("design:returntype", void 0)
], DocumentTypeController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocumentTypeController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocumentTypeController.prototype, "remove", null);
exports.DocumentTypeController = DocumentTypeController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('document-types'),
    __metadata("design:paramtypes", [document_type_service_1.DocumentTypeService])
], DocumentTypeController);
//# sourceMappingURL=document-type.controller.js.map