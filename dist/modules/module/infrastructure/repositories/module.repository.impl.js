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
exports.ModuleRepositoryImpl = void 0;
const module_orm_entity_1 = require("../persistence/module.orm-entity");
const module_entity_1 = require("../../domain/entities/module.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let ModuleRepositoryImpl = class ModuleRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(modules) {
        const entity = this.repo.create({
            code: modules.code,
            desc_icon: modules.desc_icon,
            description: modules.description,
            enabled: modules.enabled,
            created_by: modules.createdById
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
            data: branches.map(modules => this.toDomain(modules)),
            total,
        };
    }
    async findById(id) {
        const modules = await this.repo.findOne({ where: { id, deleted: false } });
        return modules ? this.toDomain(modules) : null;
    }
    async update(modules) {
        await this.repo.update({ id: modules.id }, {
            code: modules.code,
            desc_icon: modules.desc_icon,
            description: modules.description,
            enabled: modules.enabled
        });
        const updated = await this.repo.findOne({ where: { id: modules.id } });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new module_entity_1.Module(entity.id, entity.code, entity.desc_icon, entity.description, entity.enabled, entity.created_at);
    }
};
exports.ModuleRepositoryImpl = ModuleRepositoryImpl;
exports.ModuleRepositoryImpl = ModuleRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(module_orm_entity_1.ModuleOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ModuleRepositoryImpl);
//# sourceMappingURL=module.repository.impl.js.map