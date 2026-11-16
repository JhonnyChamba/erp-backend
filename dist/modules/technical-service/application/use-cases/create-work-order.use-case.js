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
exports.CreateWorkOrderUseCase = void 0;
const common_1 = require("@nestjs/common");
const work_order_repository_1 = require("../../domain/repositories/work-order.repository");
const work_order_entity_1 = require("../../domain/entities/work-order.entity");
let CreateWorkOrderUseCase = class CreateWorkOrderUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, currentUser) {
        const companyId = Number(dto.companyId || currentUser?.company_id || currentUser?.companyId || 1);
        const orderNumber = dto.orderNumber?.trim()
            ? dto.orderNumber.trim()
            : await this.repository.generateNextOrderNumber(companyId);
        const items = (dto.items || []).map((i) => ({
            itemType: i.itemType,
            description: i.description.trim(),
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
            subtotal: (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0),
        }));
        let partsCost = Number(dto.partsCost) || 0;
        let laborCost = Number(dto.laborCost) || 0;
        if (items.length > 0) {
            const partsSum = items
                .filter((i) => i.itemType === 'REPUESTO')
                .reduce((sum, i) => sum + i.subtotal, 0);
            const laborSum = items
                .filter((i) => i.itemType === 'SERVICIO')
                .reduce((sum, i) => sum + i.subtotal, 0);
            if (partsSum > 0)
                partsCost = partsSum;
            if (laborSum > 0)
                laborCost = laborSum;
        }
        const subtotal = partsCost + laborCost;
        const taxAmount = Number(dto.taxAmount) || 0;
        const totalAmount = subtotal + taxAmount;
        const advancePayment = Number(dto.advancePayment) || 0;
        const pendingBalance = Math.max(0, totalAmount - advancePayment);
        const workOrder = new work_order_entity_1.WorkOrder(null, companyId, dto.branchId ? Number(dto.branchId) : null, Number(dto.customerId), dto.customerName || null, dto.customerPhone || null, dto.customerEmail || null, dto.technicianId ? Number(dto.technicianId) : null, dto.technicianName || null, orderNumber, dto.serviceType || 'REPARACION', dto.priority || 'MEDIA', dto.status || 'RECIBIDO', dto.equipmentType || 'Laptop', dto.brand || null, dto.model || null, dto.serialNumber || null, dto.color || null, dto.securityPin || null, dto.accessories || null, dto.physicalCondition || null, dto.reportedFailure, dto.technicalDiagnosis || null, dto.solutionApplied || null, dto.entryDate ? new Date(dto.entryDate) : new Date(), dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : null, null, Number(dto.warrantyDays) || 30, laborCost, partsCost, subtotal, taxAmount, totalAmount, advancePayment, pendingBalance, dto.notes || null, false, undefined, undefined, items);
        return this.repository.create(workOrder, items);
    }
};
exports.CreateWorkOrderUseCase = CreateWorkOrderUseCase;
exports.CreateWorkOrderUseCase = CreateWorkOrderUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [work_order_repository_1.WorkOrderRepository])
], CreateWorkOrderUseCase);
//# sourceMappingURL=create-work-order.use-case.js.map