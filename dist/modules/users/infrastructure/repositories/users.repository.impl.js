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
exports.UsersRepositoryImpl = void 0;
const password_service_1 = require("../../../../common/password/password.service");
const users_orm_entity_1 = require("../persistence/users.orm-entity");
const user_company_orm_entity_1 = require("../../../user-company/infrastructure/persistence/user-company.orm-entity");
const users_entity_1 = require("../../domain/entities/users.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let UsersRepositoryImpl = class UsersRepositoryImpl {
    repo;
    userCompanyRepo;
    passwordService;
    constructor(repo, userCompanyRepo, passwordService) {
        this.repo = repo;
        this.userCompanyRepo = userCompanyRepo;
        this.passwordService = passwordService;
    }
    async create(user) {
        const hashedPassword = await this.passwordService.hash(user.password);
        const entity = this.repo.create({
            num_document: user.num_document,
            name_user: user.name_user,
            last_name_user: user.last_name_user,
            email: user.email,
            password: hashedPassword,
            developer: user.developer,
            super_admin: user.super_admin,
            multi_company: user.multi_company,
            enabled: user.enabled,
            theme_color: user.theme_color || 'Blue_Theme',
            company: { id: user.companyId },
        });
        const saved = await this.repo.save(entity);
        if (user.multi_company && user.companyIds && user.companyIds.length > 0) {
            await this.syncUserCompanies(saved.id, user.companyIds);
        }
        const fullUser = await this.findById(saved.id);
        return fullUser;
    }
    async findByCompany(companyId, page, limit) {
        const [users, total] = await this.repo.findAndCount({
            where: [
                { company: { id: companyId }, deleted: false },
                { userCompanies: { company: { id: companyId }, deleted: false, enabled: true } },
            ],
            relations: ['company', 'userCompanies', 'userCompanies.company'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: users.map(user => this.toDomain(user)),
            total,
        };
    }
    async findById(id, companyId) {
        const whereClause = { id, deleted: false };
        if (companyId) {
            whereClause.company = { id: companyId };
        }
        let user = await this.repo.findOne({
            where: whereClause,
            relations: ['company', 'userCompanies', 'userCompanies.company'],
        });
        if (!user && companyId) {
            user = await this.repo.findOne({
                where: { id, deleted: false },
                relations: ['company', 'userCompanies', 'userCompanies.company'],
            });
        }
        return user ? this.toDomain(user) : null;
    }
    async update(user) {
        await this.repo.update({ id: user.id }, {
            num_document: user.num_document,
            name_user: user.name_user,
            last_name_user: user.last_name_user,
            email: user.email,
            password: user.password,
            developer: user.developer,
            super_admin: user.super_admin,
            multi_company: user.multi_company,
            enabled: user.enabled,
            theme_color: user.theme_color || 'Blue_Theme',
        });
        if (user.companyIds !== undefined) {
            if (user.multi_company) {
                await this.syncUserCompanies(user.id, user.companyIds);
            }
            else {
                await this.userCompanyRepo
                    .createQueryBuilder()
                    .update(user_company_orm_entity_1.UserCompanyOrmEntity)
                    .set({ deleted: true, enabled: false })
                    .where('user_id = :userId', { userId: user.id })
                    .execute();
            }
        }
        const updated = await this.findById(user.id);
        return updated;
    }
    async findByEmail(email) {
        const user = await this.repo.findOne({
            where: { email },
            relations: ['company', 'userCompanies', 'userCompanies.company'],
        });
        if (!user)
            return null;
        return this.toDomain(user);
    }
    async syncUserCompanies(userId, companyIds) {
        const targetIds = (companyIds || []).map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
        const existing = await this.userCompanyRepo.find({
            where: { user: { id: userId } },
            relations: ['company'],
        });
        const existingMap = new Map();
        for (const item of existing) {
            const cId = Number(item.company?.id);
            if (cId) {
                existingMap.set(cId, item);
            }
        }
        for (const [cId, item] of existingMap.entries()) {
            if (!targetIds.includes(cId)) {
                item.deleted = true;
                item.enabled = false;
                await this.userCompanyRepo.save(item);
            }
        }
        for (const cId of targetIds) {
            const item = existingMap.get(cId);
            if (item) {
                item.deleted = false;
                item.enabled = true;
                await this.userCompanyRepo.save(item);
            }
            else {
                const newItem = this.userCompanyRepo.create({
                    user: { id: userId },
                    company: { id: cId },
                    enabled: true,
                    deleted: false,
                });
                await this.userCompanyRepo.save(newItem);
            }
        }
    }
    toDomain(entity) {
        const activeCompanyIds = (entity.userCompanies || [])
            .filter(uc => !uc.deleted && uc.enabled && uc.company?.id)
            .map(uc => uc.company.id);
        return new users_entity_1.Users(entity.id, entity.num_document, entity.name_user, entity.last_name_user, entity.email, entity.password, entity.company?.id ?? entity.company_id ?? 1, entity.developer ?? false, entity.multi_company ?? false, entity.enabled ?? true, entity.deleted ?? false, entity.created_at, entity.theme_color || 'Blue_Theme', entity.super_admin ?? false, activeCompanyIds);
    }
};
exports.UsersRepositoryImpl = UsersRepositoryImpl;
exports.UsersRepositoryImpl = UsersRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_orm_entity_1.UsersOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_company_orm_entity_1.UserCompanyOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        password_service_1.PasswordService])
], UsersRepositoryImpl);
//# sourceMappingURL=users.repository.impl.js.map