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
exports.EmployeeCategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_category_orm_entity_1 = require("../infrastructure/persistence/employee-category.orm-entity");
let EmployeeCategoryService = class EmployeeCategoryService {
    categoryRepo;
    constructor(categoryRepo) {
        this.categoryRepo = categoryRepo;
    }
    async list(companyId, activeOnly = false) {
        const qb = this.categoryRepo
            .createQueryBuilder('c')
            .where('c.company_id = :companyId AND c.deleted = false', { companyId })
            .orderBy('c.name', 'ASC');
        if (activeOnly) {
            qb.andWhere('c.active = true');
        }
        return qb.getMany();
    }
    async getById(id, companyId) {
        const category = await this.categoryRepo.findOne({
            where: { id, company_id: companyId, deleted: false },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Categoría/Cargo con ID ${id} no encontrado.`);
        }
        return category;
    }
    async create(companyId, dto) {
        const entity = this.categoryRepo.create({
            ...dto,
            company_id: companyId,
        });
        return this.categoryRepo.save(entity);
    }
    async update(id, companyId, dto) {
        const category = await this.getById(id, companyId);
        Object.assign(category, dto);
        return this.categoryRepo.save(category);
    }
    async toggleStatus(id, companyId) {
        const category = await this.getById(id, companyId);
        category.active = !category.active;
        return this.categoryRepo.save(category);
    }
    async remove(id, companyId) {
        const category = await this.getById(id, companyId);
        category.deleted = true;
        await this.categoryRepo.save(category);
    }
};
exports.EmployeeCategoryService = EmployeeCategoryService;
exports.EmployeeCategoryService = EmployeeCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_category_orm_entity_1.EmployeeCategoryOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmployeeCategoryService);
//# sourceMappingURL=employee-category.service.js.map