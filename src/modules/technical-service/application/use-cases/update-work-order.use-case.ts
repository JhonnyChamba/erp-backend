import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import { WorkOrder, WorkOrderItem } from '../../domain/entities/work-order.entity';
import { UpdateWorkOrderDto } from '../dto/update-work-order.dto';

@Injectable()
export class UpdateWorkOrderUseCase {
  constructor(private readonly repository: WorkOrderRepository) {}

  async execute(id: number, companyId: number, dto: UpdateWorkOrderDto): Promise<WorkOrder> {
    const existing = await this.repository.findById(id, companyId);
    if (!existing) throw new NotFoundException('Orden de trabajo no encontrada');

    const items: WorkOrderItem[] = dto.items !== undefined
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

    // Mismo criterio que en el alta: laborCost = mano de obra base + ítems que no
    // son repuestos; partsCost = ítems de repuesto. La base guardada se recupera
    // restando a existing.laborCost los ítems no-repuesto que ya tenía la orden.
    const sumItems = (list: WorkOrderItem[], parts: boolean) =>
      list
        .filter((i) => (i.itemType === 'REPUESTO') === parts)
        .reduce((sum, i) => sum + i.subtotal, 0);

    const existingBaseLabor = Math.max(0, existing.laborCost - sumItems(existing.items, false));
    const baseLabor = dto.laborCost !== undefined ? Number(dto.laborCost) || 0 : existingBaseLabor;

    const laborCost = baseLabor + sumItems(items, false);
    const partsCost =
      dto.items !== undefined
        ? items.length > 0
          ? sumItems(items, true)
          : dto.partsCost !== undefined
            ? Number(dto.partsCost) || 0
            : 0
        : dto.partsCost !== undefined
          ? Number(dto.partsCost) || 0
          : existing.partsCost;

    const subtotal = partsCost + laborCost;
    const taxAmount = dto.taxAmount !== undefined ? Number(dto.taxAmount) : existing.taxAmount;
    const totalAmount = subtotal + taxAmount;
    const advancePayment = dto.advancePayment !== undefined ? Number(dto.advancePayment) : existing.advancePayment;
    const pendingBalance = Math.max(0, totalAmount - advancePayment);

    const updated = new WorkOrder(
      id,
      companyId,
      dto.branchId !== undefined ? (dto.branchId ? Number(dto.branchId) : null) : existing.branchId,
      dto.customerId !== undefined ? Number(dto.customerId) : existing.customerId,
      dto.customerName !== undefined ? dto.customerName : existing.customerName,
      dto.customerPhone !== undefined ? dto.customerPhone : existing.customerPhone,
      dto.customerEmail !== undefined ? dto.customerEmail : existing.customerEmail,
      dto.technicianId !== undefined ? (dto.technicianId ? Number(dto.technicianId) : null) : existing.technicianId,
      dto.technicianName !== undefined ? dto.technicianName : existing.technicianName,
      dto.orderNumber || existing.orderNumber,
      dto.serviceType || existing.serviceType,
      dto.priority || existing.priority,
      dto.status || existing.status,
      dto.equipmentType || existing.equipmentType,
      dto.brand !== undefined ? dto.brand : existing.brand,
      dto.model !== undefined ? dto.model : existing.model,
      dto.serialNumber !== undefined ? dto.serialNumber : existing.serialNumber,
      dto.color !== undefined ? dto.color : existing.color,
      dto.securityPin !== undefined ? dto.securityPin : existing.securityPin,
      dto.accessories !== undefined ? dto.accessories : existing.accessories,
      dto.physicalCondition !== undefined ? dto.physicalCondition : existing.physicalCondition,
      dto.reportedFailure || existing.reportedFailure,
      dto.technicalDiagnosis !== undefined ? dto.technicalDiagnosis : existing.technicalDiagnosis,
      dto.solutionApplied !== undefined ? dto.solutionApplied : existing.solutionApplied,
      dto.entryDate ? new Date(dto.entryDate) : existing.entryDate,
      dto.estimatedDeliveryDate !== undefined
        ? (dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : null)
        : existing.estimatedDeliveryDate,
      dto.realDeliveryDate !== undefined
        ? (dto.realDeliveryDate ? new Date(dto.realDeliveryDate) : null)
        : existing.realDeliveryDate,
      dto.warrantyDays !== undefined ? Number(dto.warrantyDays) : existing.warrantyDays,
      laborCost,
      partsCost,
      subtotal,
      taxAmount,
      totalAmount,
      advancePayment,
      pendingBalance,
      dto.notes !== undefined ? dto.notes : existing.notes,
      false,
      existing.createdAt,
      new Date(),
      items,
    );

    return this.repository.update(updated, items);
  }
}
