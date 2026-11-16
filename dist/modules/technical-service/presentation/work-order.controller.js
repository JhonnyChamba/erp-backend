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
exports.WorkOrderController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const company_access_guard_1 = require("../../../auth/guards/company-access.guard");
const create_work_order_use_case_1 = require("../application/use-cases/create-work-order.use-case");
const list_work_orders_use_case_1 = require("../application/use-cases/list-work-orders.use-case");
const get_work_order_use_case_1 = require("../application/use-cases/get-work-order.use-case");
const update_work_order_use_case_1 = require("../application/use-cases/update-work-order.use-case");
const update_work_order_status_use_case_1 = require("../application/use-cases/update-work-order-status.use-case");
const delete_work_order_use_case_1 = require("../application/use-cases/delete-work-order.use-case");
const create_work_order_dto_1 = require("../application/dto/create-work-order.dto");
const update_work_order_dto_1 = require("../application/dto/update-work-order.dto");
const list_work_orders_dto_1 = require("../application/dto/list-work-orders.dto");
const update_work_order_status_dto_1 = require("../application/dto/update-work-order-status.dto");
const work_order_repository_1 = require("../domain/repositories/work-order.repository");
let WorkOrderController = class WorkOrderController {
    createUseCase;
    listUseCase;
    getUseCase;
    updateUseCase;
    updateStatusUseCase;
    deleteUseCase;
    repository;
    constructor(createUseCase, listUseCase, getUseCase, updateUseCase, updateStatusUseCase, deleteUseCase, repository) {
        this.createUseCase = createUseCase;
        this.listUseCase = listUseCase;
        this.getUseCase = getUseCase;
        this.updateUseCase = updateUseCase;
        this.updateStatusUseCase = updateStatusUseCase;
        this.deleteUseCase = deleteUseCase;
        this.repository = repository;
    }
    create(dto, req) {
        const companyId = req.companyId || req.user?.companyId || 1;
        return this.createUseCase.execute({ ...dto, companyId }, req.user);
    }
    list(query, req) {
        const companyId = req.companyId || req.user?.companyId || 1;
        return this.listUseCase.execute(companyId, query);
    }
    async getNextNumber(req) {
        const companyId = req.companyId || req.user?.companyId || 1;
        const orderNumber = await this.repository.generateNextOrderNumber(companyId);
        return { orderNumber };
    }
    get(id, req) {
        const companyId = req.companyId || req.user?.companyId || 1;
        return this.getUseCase.execute(Number(id), companyId);
    }
    update(id, dto, req) {
        const companyId = req.companyId || req.user?.companyId || 1;
        return this.updateUseCase.execute(Number(id), companyId, dto);
    }
    updateStatus(id, dto, req) {
        const companyId = req.companyId || req.user?.companyId || 1;
        return this.updateStatusUseCase.execute(Number(id), companyId, dto);
    }
    delete(id, req) {
        const companyId = req.companyId || req.user?.companyId || 1;
        return this.deleteUseCase.execute(Number(id), companyId);
    }
};
exports.WorkOrderController = WorkOrderController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_work_order_dto_1.CreateWorkOrderDto, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_work_orders_dto_1.ListWorkOrdersDto, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_work_order_dto_1.UpdateWorkOrderDto, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_work_order_status_dto_1.UpdateWorkOrderStatusDto, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "delete", null);
exports.WorkOrderController = WorkOrderController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), company_access_guard_1.CompanyAccessGuard),
    (0, common_1.Controller)('technical-service'),
    __metadata("design:paramtypes", [create_work_order_use_case_1.CreateWorkOrderUseCase,
        list_work_orders_use_case_1.ListWorkOrdersUseCase,
        get_work_order_use_case_1.GetWorkOrderUseCase,
        update_work_order_use_case_1.UpdateWorkOrderUseCase,
        update_work_order_status_use_case_1.UpdateWorkOrderStatusUseCase,
        delete_work_order_use_case_1.DeleteWorkOrderUseCase,
        work_order_repository_1.WorkOrderRepository])
], WorkOrderController);
//# sourceMappingURL=work-order.controller.js.map