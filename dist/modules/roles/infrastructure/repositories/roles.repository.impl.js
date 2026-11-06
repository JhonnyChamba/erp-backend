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
exports.RolesRepositoryImpl = void 0;
const roles_orm_entity_1 = require("../persistence/roles.orm-entity");
const roles_entity_1 = require("../../domain/entities/roles.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let RolesRepositoryImpl = class RolesRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(roles) {
        const entity = this.repo.create({
            code: roles.code,
            description: roles.description,
            enabled: roles.enabled,
            company: { id: roles.companyId },
            created_by: roles.createdById
        });
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async findByCompany(companyId, page, limit) {
        const [branches, total] = await this.repo.findAndCount({
            where: { company: { id: companyId }, deleted: false },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: branches.map(roles => this.toDomain(roles)),
            total,
        };
    }
    async findById(id, companyId) {
        const roles = await this.repo.findOne({
            where: {
                id,
                company: { id: companyId },
                deleted: false,
            },
        });
        return roles ? this.toDomain(roles) : null;
    }
    async update(roles) {
        await this.repo.update({
            id: roles.id,
            company: { id: roles.companyId },
        }, {
            code: roles.code,
            description: roles.description,
            enabled: roles.enabled,
        });
        const updated = await this.repo.findOne({
            where: {
                id: roles.id,
                company: { id: roles.companyId },
            },
        });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new roles_entity_1.Roles(entity.id, entity.code, entity.description, entity.company?.id, entity.enabled, entity.created_at);
    }
};
exports.RolesRepositoryImpl = RolesRepositoryImpl;
exports.RolesRepositoryImpl = RolesRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(roles_orm_entity_1.RolesOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesRepositoryImpl);
//# sourceMappingURL=roles.repository.impl.js.map