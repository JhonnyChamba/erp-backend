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
exports.subModulesController = void 0;
const create_sub_module_use_case_1 = require("../application/use-cases/create-sub-module.use-case");
const update_sub_module_use_case_1 = require("../application/use-cases/update-sub-module.use-case");
const common_1 = require("@nestjs/common");
const list_sub_module_use_case_1 = require("../application/use-cases/list-sub-module.use-case");
const get_sub_module_use_case_1 = require("../application/use-cases/get-sub-module.use-case");
const create_sub_module_dto_1 = require("../application/dto/create-sub-module.dto");
const update_sub_module_dto_1 = require("../application/dto/update-sub-module.dto");
const list_sub_module_dto_1 = require("../application/dto/list-sub-module.dto");
const passport_1 = require("@nestjs/passport");
let subModulesController = class subModulesController {
    createUseCase;
    listUseCase;
    getUseCase;
    updateUseCase;
    constructor(createUseCase, listUseCase, getUseCase, updateUseCase) {
        this.createUseCase = createUseCase;
        this.listUseCase = listUseCase;
        this.getUseCase = getUseCase;
        this.updateUseCase = updateUseCase;
    }
    create(dto, req) {
        return this.createUseCase.execute(dto, req.user);
    }
    list(query, req) {
        return this.listUseCase.execute(query, req.user);
    }
    get(id, req) {
        return this.getUseCase.execute(Number(id), req.moduleId);
    }
    update(id, dto, req) {
        return this.updateUseCase.execute(Number(id), dto.moduleId ?? req.moduleId, dto);
    }
};
exports.subModulesController = subModulesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sub_module_dto_1.CreatesubModulesDto, Object]),
    __metadata("design:returntype", void 0)
], subModulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_sub_module_dto_1.ListsubModulesDto, Object]),
    __metadata("design:returntype", void 0)
], subModulesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], subModulesController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_sub_module_dto_1.UpdatesubModulesDto, Object]),
    __metadata("design:returntype", void 0)
], subModulesController.prototype, "update", null);
exports.subModulesController = subModulesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('subModule'),
    __metadata("design:paramtypes", [create_sub_module_use_case_1.CreatesubModulesUseCase,
        list_sub_module_use_case_1.ListsubModulesUseCase,
        get_sub_module_use_case_1.GetsubModulesUseCase,
        update_sub_module_use_case_1.UpdatesubModulesUseCase])
], subModulesController);
//# sourceMappingURL=sub-module.controller.js.map