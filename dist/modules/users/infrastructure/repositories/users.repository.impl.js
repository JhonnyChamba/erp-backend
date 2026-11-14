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
const access_control_service_1 = require("../../../../auth/access-control.service");
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
        const isSuperAdmin = Boolean(user.super_admin);
        const isMultiCompany = isSuperAdmin ? false : Boolean(user.multi_company);
        let primaryRoleId = isSuperAdmin ? null : (user.roleId ?? null);
        if (isMultiCompany && Array.isArray(user.companyRoles)) {
            const matchPrimary = user.companyRoles.find((cr) => Number(cr.companyId) === Number(user.companyId));
            if (matchPrimary?.roleId) {
                primaryRoleId = Number(matchPrimary.roleId);
            }
        }
        const entity = this.repo.create({
            num_document: user.num_document,
            name_user: user.name_user,
            last_name_user: user.last_name_user,
            email: user.email,
            password: hashedPassword,
            developer: isSuperAdmin,
            super_admin: isSuperAdmin,
            multi_company: isMultiCompany,
            enabled: user.enabled,
            theme_color: user.theme_color || 'Blue_Theme',
            birth_date: user.birth_date || null,
            photo_url: user.photo_url || '/controller/images/profile/user-1.jpg',
            company: { id: user.companyId },
            role: primaryRoleId ? { id: primaryRoleId } : null,
        });
        const saved = await this.repo.save(entity);
        if (!isSuperAdmin) {
            if (isMultiCompany) {
                await this.syncUserCompanies(saved.id, user.companyIds || [], user.companyRoles || []);
            }
            else {
                await this.syncUserCompanies(saved.id, [user.companyId], [{ companyId: user.companyId, roleId: primaryRoleId }]);
            }
        }
        access_control_service_1.AccessControlService.clearCache(undefined, saved.id);
        const fullUser = await this.findById(saved.id, user.companyId);
        return fullUser;
    }
    async findByCompany(companyId, page = 1, limit = 50) {
        const targetCompanyId = Number(companyId);
        const whereClause = targetCompanyId && targetCompanyId > 0
            ? [
                { company: { id: targetCompanyId }, deleted: false },
                { userCompanies: { company: { id: targetCompanyId }, deleted: false, enabled: true } },
            ]
            : { deleted: false };
        const [users, total] = await this.repo.findAndCount({
            where: whereClause,
            relations: ['company', 'role', 'userCompanies', 'userCompanies.company', 'userCompanies.role'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: users.map(user => this.toDomain(user, targetCompanyId || undefined)),
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
            relations: ['company', 'role', 'userCompanies', 'userCompanies.company', 'userCompanies.role'],
        });
        if (!user && companyId) {
            user = await this.repo.findOne({
                where: { id, deleted: false },
                relations: ['company', 'role', 'userCompanies', 'userCompanies.company', 'userCompanies.role'],
            });
        }
        return user ? this.toDomain(user, companyId) : null;
    }
    async update(user) {
        const isSuperAdmin = Boolean(user.super_admin);
        const isMultiCompany = isSuperAdmin ? false : Boolean(user.multi_company);
        let primaryRoleId = isSuperAdmin ? null : (user.roleId ?? null);
        if (isMultiCompany && Array.isArray(user.companyRoles)) {
            const matchPrimary = user.companyRoles.find((cr) => Number(cr.companyId) === Number(user.companyId));
            if (matchPrimary?.roleId !== undefined) {
                primaryRoleId = matchPrimary.roleId ? Number(matchPrimary.roleId) : null;
            }
        }
        const updateData = {
            num_document: user.num_document,
            name_user: user.name_user,
            last_name_user: user.last_name_user,
            email: user.email,
            password: user.password,
            developer: isSuperAdmin,
            super_admin: isSuperAdmin,
            multi_company: isMultiCompany,
            enabled: user.enabled,
            theme_color: user.theme_color || 'Blue_Theme',
            birth_date: user.birth_date || null,
            photo_url: user.photo_url || null,
            role: primaryRoleId ? { id: primaryRoleId } : null,
        };
        if (user.companyId) {
            updateData.company = { id: user.companyId };
        }
        await this.repo.update({ id: user.id }, updateData);
        if (isSuperAdmin) {
            await this.userCompanyRepo
                .createQueryBuilder()
                .update(user_company_orm_entity_1.UserCompanyOrmEntity)
                .set({ deleted: true, enabled: false })
                .where('user_id = :userId', { userId: user.id })
                .execute();
        }
        else if (isMultiCompany) {
            await this.syncUserCompanies(user.id, user.companyIds || [], user.companyRoles || []);
        }
        else {
            await this.syncUserCompanies(user.id, [user.companyId], [{ companyId: user.companyId, roleId: primaryRoleId }]);
        }
        access_control_service_1.AccessControlService.clearCache(undefined, user.id);
        const updated = await this.findById(user.id, user.companyId);
        return updated;
    }
    async findByEmail(email) {
        const user = await this.repo.findOne({
            where: { email },
            relations: ['company', 'role', 'userCompanies', 'userCompanies.company', 'userCompanies.role'],
        });
        if (!user)
            return null;
        return this.toDomain(user);
    }
    async syncUserCompanies(userId, companyIds, companyRoles = []) {
        const roleMap = new Map();
        for (const cr of companyRoles || []) {
            const cId = Number(cr.companyId);
            if (cId > 0) {
                roleMap.set(cId, cr.roleId ? Number(cr.roleId) : null);
            }
        }
        const combinedCompanyIds = Array.from(new Set([
            ...(companyIds || []).map(Number),
            ...Array.from(roleMap.keys()),
        ])).filter((id) => !isNaN(id) && id > 0);
        const existing = await this.userCompanyRepo.find({
            where: { user: { id: userId } },
            relations: ['company', 'role'],
        });
        const existingMap = new Map();
        for (const item of existing) {
            const cId = Number(item.company?.id);
            if (cId) {
                existingMap.set(cId, item);
            }
        }
        for (const [cId, item] of existingMap.entries()) {
            if (!combinedCompanyIds.includes(cId)) {
                item.deleted = true;
                item.enabled = false;
                await this.userCompanyRepo.save(item);
            }
        }
        for (const cId of combinedCompanyIds) {
            const assignedRoleId = roleMap.get(cId) ?? null;
            const item = existingMap.get(cId);
            if (item) {
                item.deleted = false;
                item.enabled = true;
                item.role = assignedRoleId ? { id: assignedRoleId } : null;
                await this.userCompanyRepo.save(item);
            }
            else {
                const newItem = this.userCompanyRepo.create({
                    user: { id: userId },
                    company: { id: cId },
                    role: assignedRoleId ? { id: assignedRoleId } : null,
                    enabled: true,
                    deleted: false,
                });
                await this.userCompanyRepo.save(newItem);
            }
        }
    }
    toDomain(entity, contextCompanyId) {
        const activeUserCompanies = (entity.userCompanies || []).filter((uc) => !uc.deleted && uc.enabled && uc.company?.id);
        const activeCompanyIds = activeUserCompanies.map((uc) => Number(uc.company.id));
        const companyRoles = activeUserCompanies.map((uc) => ({
            companyId: Number(uc.company.id),
            roleId: uc.role?.id ? Number(uc.role.id) : null,
            roleName: uc.role?.description || uc.role?.code || null,
        }));
        const targetCompId = contextCompanyId || entity.company?.id || 1;
        const matchingCompanyRole = companyRoles.find((cr) => Number(cr.companyId) === Number(targetCompId));
        const effectiveRoleId = matchingCompanyRole?.roleId ?? (entity.role?.id ? Number(entity.role.id) : null);
        const effectiveRoleName = matchingCompanyRole?.roleName ??
            entity.role?.description ??
            entity.role?.code ??
            null;
        return new users_entity_1.Users(entity.id, entity.num_document, entity.name_user, entity.last_name_user, entity.email, entity.password, entity.company?.id ?? entity.company_id ?? 1, entity.developer ?? false, entity.multi_company ?? false, entity.enabled ?? true, entity.deleted ?? false, entity.created_at, entity.theme_color || 'Blue_Theme', entity.super_admin ?? false, activeCompanyIds, effectiveRoleId, effectiveRoleName, companyRoles, entity.birth_date ?? null, entity.photo_url ?? null);
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