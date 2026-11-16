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
exports.PlansRepositoryImpl = void 0;
const plans_orm_entity_1 = require("../persistence/plans.orm-entity");
const plans_entity_1 = require("../../domain/entities/plans.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
let PlansRepositoryImpl = class PlansRepositoryImpl {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(company) {
        const entity = this.repo.create({
            price: company.price,
            billing_cycle: company.billing_cycle,
            description: company.description,
            max_users: company.max_users,
            max_branches: company.max_branches,
            enabled: company.enabled,
            created_name: company.created_name,
            createdBy: { id: company.createdById }
        });
        const saved = await this.repo.save(entity);
        if (company.moduleIds && company.moduleIds.length > 0) {
            for (const modId of company.moduleIds) {
                await this.repo.manager.query('INSERT INTO tab_plans_module (plans_id, module_id) VALUES ($1, $2)', [saved.id, modId]);
            }
        }
        const domain = this.toDomain(saved);
        domain.moduleIds = company.moduleIds || [];
        return domain;
    }
    async findByPlans(page, limit, search) {
        const qb = this.repo.createQueryBuilder('p');
        if (search && search.trim()) {
            qb.where('LOWER(p.description) LIKE :search', {
                search: `%${search.trim().toLowerCase()}%`,
            });
        }
        qb.orderBy('p.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [branches, total] = await qb.getManyAndCount();
        const planIds = branches.map((b) => b.id);
        const modMap = {};
        if (planIds.length > 0) {
            const pms = await this.repo.manager.query('SELECT plans_id, module_id FROM tab_plans_module WHERE plans_id = ANY($1)', [planIds]);
            for (const row of pms || []) {
                const pId = Number(row.plans_id);
                if (!modMap[pId])
                    modMap[pId] = [];
                modMap[pId].push(Number(row.module_id));
            }
        }
        return {
            data: branches.map((company) => {
                const d = this.toDomain(company);
                d.moduleIds = modMap[d.id] || [];
                return d;
            }),
            total,
        };
    }
    async findById(id) {
        const company = await this.repo.findOne({ where: { id } });
        if (!company)
            return null;
        const domain = this.toDomain(company);
        const pms = await this.repo.manager.query('SELECT module_id FROM tab_plans_module WHERE plans_id = $1', [id]);
        domain.moduleIds = (pms || []).map((r) => Number(r.module_id));
        return domain;
    }
    async update(company) {
        await this.repo.update({ id: company.id }, {
            price: company.price,
            billing_cycle: company.billing_cycle,
            description: company.description,
            max_users: company.max_users,
            max_branches: company.max_branches,
            enabled: company.enabled,
        });
        const updated = await this.repo.findOne({ where: { id: company.id } });
        return this.toDomain(updated);
    }
    toDomain(entity) {
        return new plans_entity_1.Plans(entity.id, entity.price, entity.billing_cycle, entity.description, entity.max_users, entity.max_branches, entity.enabled, entity.created_name, entity.createdAt);
    }
};
exports.PlansRepositoryImpl = PlansRepositoryImpl;
exports.PlansRepositoryImpl = PlansRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(plans_orm_entity_1.PlansOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PlansRepositoryImpl);
//# sourceMappingURL=plans.repository.impl.js.map