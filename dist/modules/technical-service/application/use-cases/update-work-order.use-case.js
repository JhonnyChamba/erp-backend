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
exports.UpdateWorkOrderUseCase = void 0;
const common_1 = require("@nestjs/common");
const work_order_repository_1 = require("../../domain/repositories/work-order.repository");
const work_order_entity_1 = require("../../domain/entities/work-order.entity");
let UpdateWorkOrderUseCase = class UpdateWorkOrderUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, companyId, dto) {
        const existing = await this.repository.findById(id, companyId);
        if (!existing)
            throw new common_1.NotFoundException('Orden de trabajo no encontrada');
        const items = dto.items !== undefined
            ? dto.items.map((i) => ({
                id: i.id,
                workOrderId: id,
                itemType: i.itemType,
                description: i.description.trim(),
                quantity: Number(i.quantity) || 1,
                unitPrice: Number(i.unitPrice) || 0,
                subtotal: (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0),
            }))
            : existing.items;
        let partsCost = dto.partsCost !== undefined ? Number(dto.partsCost) : existing.partsCost;
        let laborCost = dto.laborCost !== undefined ? Number(dto.laborCost) : existing.laborCost;
        if (dto.items !== undefined && items.length > 0) {
            const partsSum = items
                .filter((i) => i.itemType === 'REPUESTO')
                .reduce((sum, i) => sum + i.subtotal, 0);
            const laborSum = items
                .filter((i) => i.itemType === 'SERVICIO')
                .reduce((sum, i) => sum + i.subtotal, 0);
            partsCost = partsSum;
            laborCost = laborSum;
        }
        const subtotal = partsCost + laborCost;
        const taxAmount = dto.taxAmount !== undefined ? Number(dto.taxAmount) : existing.taxAmount;
        const totalAmount = subtotal + taxAmount;
        const advancePayment = dto.advancePayment !== undefined ? Number(dto.advancePayment) : existing.advancePayment;
        const pendingBalance = Math.max(0, totalAmount - advancePayment);
        const updated = new work_order_entity_1.WorkOrder(id, companyId, dto.branchId !== undefined ? (dto.branchId ? Number(dto.branchId) : null) : existing.branchId, dto.customerId !== undefined ? Number(dto.customerId) : existing.customerId, dto.customerName !== undefined ? dto.customerName : existing.customerName, dto.customerPhone !== undefined ? dto.customerPhone : existing.customerPhone, dto.customerEmail !== undefined ? dto.customerEmail : existing.customerEmail, dto.technicianId !== undefined ? (dto.technicianId ? Number(dto.technicianId) : null) : existing.technicianId, dto.technicianName !== undefined ? dto.technicianName : existing.technicianName, dto.orderNumber || existing.orderNumber, dto.serviceType || existing.serviceType, dto.priority || existing.priority, dto.status || existing.status, dto.equipmentType || existing.equipmentType, dto.brand !== undefined ? dto.brand : existing.brand, dto.model !== undefined ? dto.model : existing.model, dto.serialNumber !== undefined ? dto.serialNumber : existing.serialNumber, dto.color !== undefined ? dto.color : existing.color, dto.securityPin !== undefined ? dto.securityPin : existing.securityPin, dto.accessories !== undefined ? dto.accessories : existing.accessories, dto.physicalCondition !== undefined ? dto.physicalCondition : existing.physicalCondition, dto.reportedFailure || existing.reportedFailure, dto.technicalDiagnosis !== undefined ? dto.technicalDiagnosis : existing.technicalDiagnosis, dto.solutionApplied !== undefined ? dto.solutionApplied : existing.solutionApplied, dto.entryDate ? new Date(dto.entryDate) : existing.entryDate, dto.estimatedDeliveryDate !== undefined
            ? (dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : null)
            : existing.estimatedDeliveryDate, dto.realDeliveryDate !== undefined
            ? (dto.realDeliveryDate ? new Date(dto.realDeliveryDate) : null)
            : existing.realDeliveryDate, dto.warrantyDays !== undefined ? Number(dto.warrantyDays) : existing.warrantyDays, laborCost, partsCost, subtotal, taxAmount, totalAmount, advancePayment, pendingBalance, dto.notes !== undefined ? dto.notes : existing.notes, false, existing.createdAt, new Date(), items);
        return this.repository.update(updated, items);
    }
};
exports.UpdateWorkOrderUseCase = UpdateWorkOrderUseCase;
exports.UpdateWorkOrderUseCase = UpdateWorkOrderUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [work_order_repository_1.WorkOrderRepository])
], UpdateWorkOrderUseCase);
//# sourceMappingURL=update-work-order.use-case.js.map