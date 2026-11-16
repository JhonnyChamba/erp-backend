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
exports.PermissionsTemplatesRepositoryImpl = void 0;
const permissions_templates_orm_entity_1 = require("../persistence/permissions-templates.orm-entity");
const permissions_templates_entity_1 = require("../../domain/entities/permissions-templates.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let PermissionsTemplatesRepositoryImpl = class PermissionsTemplatesRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(permissions) {
        const entity = this.repo.create({
            code: permissions.code,
            description: permissions.description,
            enabled: permissions.enabled,
            created_by: permissions.createdById
        });
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async findByCompany(page, limit) {
        const [branches, total] = await this.repo.findAndCount({
            where: { deleted: false },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: branches.map(permissions => this.toDomain(permissions)),
            total,
        };
    }
    async findById(id) {
        const permissions = await this.repo.findOne({ where: { id, deleted: false } });
        return permissions ? this.toDomain(permissions) : null;
    }
    async update(permissions) {
        await this.repo.update({ id: permissions.id }, {
            code: permissions.code,
            description: permissions.description,
            enabled: permissions.enabled
        });
        const updated = await this.repo.findOne({ where: { id: permissions.id } });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new permissions_templates_entity_1.PermissionsTemplates(entity.id, entity.code, entity.description, entity.enabled, entity.created_at);
    }
};
exports.PermissionsTemplatesRepositoryImpl = PermissionsTemplatesRepositoryImpl;
exports.PermissionsTemplatesRepositoryImpl = PermissionsTemplatesRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permissions_templates_orm_entity_1.PermissionsTemplatesOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PermissionsTemplatesRepositoryImpl);
//# sourceMappingURL=permissions-templates.repository.impl.js.map