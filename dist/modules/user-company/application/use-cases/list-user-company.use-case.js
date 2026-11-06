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
exports.ListUserCompanyUseCase = void 0;
const user_company_repository_1 = require("../../domain/repositories/user-company.repository");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
let ListUserCompanyUseCase = class ListUserCompanyUseCase {
    repository;
    companyRepo;
    constructor(repository, companyRepo) {
        this.repository = repository;
        this.companyRepo = companyRepo;
    }
    async execute(dto, user) {
        const isSuperAdmin = user?.super_admin || user?.developer;
        const page = dto.page && dto.page > 0 ? dto.page : 1;
        const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
        if (isSuperAdmin) {
            const [companies, total] = await this.companyRepo.findAndCount({
                where: { deleted: false, enabled: true },
                skip: (page - 1) * limit,
                take: limit,
                order: { business_name: 'ASC' },
            });
            return {
                data: companies.map(comp => ({
                    id: comp.id,
                    company: comp,
                    enabled: true,
                })),
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        const targetUserId = user?.user_id ?? dto.usersId;
        const result = await this.repository.findByCompany(targetUserId, page, limit);
        if (user?.company_id && !result.data.some(d => d.company?.id === user.company_id)) {
            const primaryComp = await this.companyRepo.findOne({
                where: { id: user.company_id, deleted: false },
            });
            if (primaryComp) {
                result.data.unshift({
                    id: 0,
                    usersId: targetUserId,
                    companyId: primaryComp.id,
                    enabled: true,
                    company: primaryComp,
                });
                result.total += 1;
            }
        }
        if (result.total === 0 && dto.companyId) {
            const singleComp = await this.companyRepo.findOne({
                where: { id: dto.companyId, deleted: false },
            });
            if (singleComp) {
                return {
                    data: [{ id: 0, company: singleComp, enabled: true }],
                    meta: { total: 1, page: 1, limit, totalPages: 1 },
                };
            }
        }
        return {
            data: result.data,
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
};
exports.ListUserCompanyUseCase = ListUserCompanyUseCase;
exports.ListUserCompanyUseCase = ListUserCompanyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __metadata("design:paramtypes", [user_company_repository_1.UserCompanyRepository,
        typeorm_2.Repository])
], ListUserCompanyUseCase);
//# sourceMappingURL=list-user-company.use-case.js.map