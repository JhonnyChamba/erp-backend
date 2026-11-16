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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListWorkOrdersUseCase = void 0;
const common_1 = require("@nestjs/common");
const work_order_repository_1 = require("../../domain/repositories/work-order.repository");
let ListWorkOrdersUseCase = class ListWorkOrdersUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, filters) {
        return this.repository.findByCompany(companyId, filters);
    }
};
exports.ListWorkOrdersUseCase = ListWorkOrdersUseCase;
exports.ListWorkOrdersUseCase = ListWorkOrdersUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [work_order_repository_1.WorkOrderRepository])
], ListWorkOrdersUseCase);
//# sourceMappingURL=list-work-orders.use-case.js.map