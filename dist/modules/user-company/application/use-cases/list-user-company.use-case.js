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
const company_orm_entity_1 = require("../../../company/infrastructure/persistence/company.orm-entity");
const user_company_repository_1 = require("../../domain/repositories/user-company.repository");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
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
            const rawData = companies.map(comp => ({
                id: comp.id,
                company: comp,
                enabled: true,
            }));
            return {
                data: await this.attachSubscriptionInfo(rawData),
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
            const primaryComp = await this.companyRepo.findOne({ where: { id: user.company_id, deleted: false } });
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
            const singleComp = await this.companyRepo.findOne({ where: { id: dto.companyId, deleted: false } });
            if (singleComp) {
                const singleData = [{ id: 0, company: singleComp, enabled: true }];
                return {
                    data: await this.attachSubscriptionInfo(singleData),
                    meta: { total: 1, page: 1, limit, totalPages: 1 },
                };
            }
        }
        return {
            data: await this.attachSubscriptionInfo(result.data),
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
    async attachSubscriptionInfo(items) {
        if (!items.length)
            return items;
        const compIds = items.map((i) => i.company?.id || i.id).filter(Boolean);
        if (!compIds.length)
            return items;
        const now = new Date();
        const subs = await this.companyRepo.manager.query(`SELECT s.id, s.company_id, s.begin_date, s.end_date, s.enabled, p.description as plan_name
			 FROM tab_subscriptions s
			 LEFT JOIN tab_plans p ON p.id = s.plan_id
			 WHERE s.company_id = ANY($1) AND s.deleted = false
			 ORDER BY s.id DESC`, [compIds]);
        return items.map((item) => {
            const cId = Number(item.company?.id || item.id);
            const compSubs = subs.filter((s) => Number(s.company_id) === cId);
            const activeSub = compSubs.find((s) => {
                if (s.enabled === false)
                    return false;
                if (!s.end_date)
                    return true;
                const end = new Date(s.end_date);
                if (isNaN(end.getTime()))
                    return true;
                end.setHours(23, 59, 59, 999);
                return end >= now;
            });
            let subscriptionInfo;
            if (activeSub) {
                subscriptionInfo = {
                    hasActiveSubscription: true,
                    status: 'active',
                    planName: activeSub.plan_name,
                    endDate: activeSub.end_date,
                };
            }
            else if (compSubs.length > 0) {
                subscriptionInfo = {
                    hasActiveSubscription: false,
                    status: 'expired',
                    planName: compSubs[0].plan_name,
                    endDate: compSubs[0].end_date,
                };
            }
            else {
                subscriptionInfo = {
                    hasActiveSubscription: false,
                    status: 'no_subscription',
                    planName: null,
                    endDate: null,
                };
            }
            return {
                ...item,
                subscription: subscriptionInfo,
                company: item.company
                    ? { ...item.company, subscription: subscriptionInfo }
                    : item.company,
            };
        });
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