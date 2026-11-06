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
exports.subModulesRepositoryImpl = void 0;
const sub_module_orm_entity_1 = require("../persistence/sub-module.orm-entity");
const sub_module_entity_1 = require("../../domain/entities/sub-module.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let subModulesRepositoryImpl = class subModulesRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(subModule) {
        const entity = this.repo.create({
            code: subModule.code,
            desc_icon: subModule.desc_icon,
            description: subModule.description,
            url_desc: subModule.url_desc,
            enabled: subModule.enabled,
            module: { id: subModule.moduleId },
            created_by: subModule.createdById,
        });
        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }
    async findByCompany(moduleId, page, limit) {
        const [subModulees, total] = await this.repo.findAndCount({
            where: { module: { id: moduleId }, deleted: false },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });
        return {
            data: subModulees.map(subModule => this.toDomain(subModule)),
            total,
        };
    }
    async findById(id, moduleId) {
        const subModule = await this.repo.findOne({
            where: {
                id,
                module: { id: moduleId },
                deleted: false,
            },
        });
        return subModule ? this.toDomain(subModule) : null;
    }
    async update(subModule) {
        await this.repo.update({
            id: subModule.id,
            module: { id: subModule.moduleId },
        }, {
            code: subModule.code,
            desc_icon: subModule.desc_icon,
            description: subModule.description,
            url_desc: subModule.url_desc,
            enabled: subModule.enabled,
        });
        const updated = await this.repo.findOne({
            where: {
                id: subModule.id,
                module: { id: subModule.moduleId },
            },
        });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new sub_module_entity_1.subModules(entity.id, entity.code, entity.desc_icon, entity.description, entity.url_desc, entity.module?.id, entity.enabled, entity.created_at);
    }
};
exports.subModulesRepositoryImpl = subModulesRepositoryImpl;
exports.subModulesRepositoryImpl = subModulesRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sub_module_orm_entity_1.subModulesOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], subModulesRepositoryImpl);
//# sourceMappingURL=sub-module.repository.impl.js.map