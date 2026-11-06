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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUsersUseCase = void 0;
const users_repository_1 = require("../../domain/repositories/users.repository");
const common_1 = require("@nestjs/common");
const password_service_1 = require("../../../../common/password/password.service");
let UpdateUsersUseCase = class UpdateUsersUseCase {
    repository;
    passwordService;
    constructor(repository, passwordService) {
        this.repository = repository;
        this.passwordService = passwordService;
    }
    async execute(id, companyId, dto) {
        const user = await this.repository.findById(id, companyId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.num_document = dto.num_document ?? user.num_document;
        user.name_user = dto.name_user ?? user.name_user;
        user.last_name_user = dto.last_name_user ?? user.last_name_user;
        user.email = dto.email ?? user.email;
        if (dto.password) {
            user.password = await this.passwordService.hash(dto.password);
        }
        user.developer = dto.developer ?? user.developer;
        user.super_admin = dto.super_admin ?? user.super_admin;
        user.multi_company = dto.multi_company ?? user.multi_company;
        user.enabled = dto.enabled ?? user.enabled;
        user.theme_color = dto.theme_color ?? user.theme_color;
        if (dto.companyIds !== undefined) {
            user.companyIds = dto.companyIds;
        }
        return this.repository.update(user);
    }
};
exports.UpdateUsersUseCase = UpdateUsersUseCase;
exports.UpdateUsersUseCase = UpdateUsersUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        password_service_1.PasswordService])
], UpdateUsersUseCase);
//# sourceMappingURL=update-users.use-case.js.map