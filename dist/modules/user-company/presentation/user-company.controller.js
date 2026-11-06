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
exports.UserCompanyController = void 0;
const common_1 = require("@nestjs/common");
const create_user_company_use_case_1 = require("../application/use-cases/create-user-company.use-case");
const update_user_company_use_case_1 = require("../application/use-cases/update-user-company.use-case");
const list_user_company_use_case_1 = require("../application/use-cases/list-user-company.use-case");
const get_user_company_use_case_1 = require("../application/use-cases/get-user-company.use-case");
const create_user_company_dto_1 = require("../application/dto/create-user-company.dto");
const update_user_company_dto_1 = require("../application/dto/update-user-company.dto");
const list_user_company_dto_1 = require("../application/dto/list-user-company.dto");
const passport_1 = require("@nestjs/passport");
let UserCompanyController = class UserCompanyController {
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
        const userId = req.user?.user_id;
        return this.getUseCase.execute(Number(id), userId);
    }
    update(id, dto, req) {
        const userId = req.user?.user_id;
        return this.updateUseCase.execute(Number(id), userId, dto);
    }
};
exports.UserCompanyController = UserCompanyController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_company_dto_1.CreateUserCompanyDto, Object]),
    __metadata("design:returntype", void 0)
], UserCompanyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('companies'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_user_company_dto_1.ListUserCompanyDto, Object]),
    __metadata("design:returntype", void 0)
], UserCompanyController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UserCompanyController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_company_dto_1.UpdateUserCompanyDto, Object]),
    __metadata("design:returntype", void 0)
], UserCompanyController.prototype, "update", null);
exports.UserCompanyController = UserCompanyController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('userCompany'),
    __metadata("design:paramtypes", [create_user_company_use_case_1.CreateUserCompanyUseCase,
        list_user_company_use_case_1.ListUserCompanyUseCase,
        get_user_company_use_case_1.GetUserCompanyUseCase,
        update_user_company_use_case_1.UpdateUserCompanyUseCase])
], UserCompanyController);
//# sourceMappingURL=user-company.controller.js.map