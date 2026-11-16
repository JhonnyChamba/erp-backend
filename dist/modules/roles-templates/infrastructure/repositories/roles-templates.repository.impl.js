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
exports.RolesTemplatesRepositoryImpl = void 0;
const roles_templates_orm_entity_1 = require("../persistence/roles-templates.orm-entity");
const roles_templates_entity_1 = require("../../domain/entities/roles-templates.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let RolesTemplatesRepositoryImpl = class RolesTemplatesRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(rolesTemplates) {
        const entity = this.repo.create({
            code: rolesTemplates.code,
            description: rolesTemplates.description,
            enabled: rolesTemplates.enabled,
            created_by: rolesTemplates.createdById
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
            data: branches.map(rolesTemplates => this.toDomain(rolesTemplates)),
            total,
        };
    }
    async findById(id) {
        const rolesTemplates = await this.repo.findOne({
            where: {
                id,
                deleted: false,
            },
        });
        return rolesTemplates ? this.toDomain(rolesTemplates) : null;
    }
    async update(rolesTemplates) {
        await this.repo.update({ id: rolesTemplates.id }, {
            code: rolesTemplates.code,
            description: rolesTemplates.description,
            enabled: rolesTemplates.enabled,
        });
        const updated = await this.repo.findOne({ where: { id: rolesTemplates.id } });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new roles_templates_entity_1.RolesTemplates(entity.id, entity.code, entity.description, entity.enabled, entity.created_at);
    }
};
exports.RolesTemplatesRepositoryImpl = RolesTemplatesRepositoryImpl;
exports.RolesTemplatesRepositoryImpl = RolesTemplatesRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(roles_templates_orm_entity_1.RolesTemplatesOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesTemplatesRepositoryImpl);
//# sourceMappingURL=roles-templates.repository.impl.js.map