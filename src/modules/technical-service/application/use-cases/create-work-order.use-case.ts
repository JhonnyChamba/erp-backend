import { Injectable } from '@nestjs/common';
import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import { WorkOrder, WorkOrderItem } from '../../domain/entities/work-order.entity';
import { CreateWorkOrderDto } from '../dto/create-work-order.dto';

@Injectable()
export class CreateWorkOrderUseCase {
  constructor(private readonly repository: WorkOrderRepository) {}

  async execute(dto: CreateWorkOrderDto, currentUser?: any): Promise<WorkOrder> {
    const companyId = Number(dto.companyId || currentUser?.company_id || currentUser?.companyId || 1);

    // Si no viene provisto, el repositorio genera el secuencial dentro de la
    // transacción de alta (con bloqueo por empresa) para no repetir números.
    const orderNumber = dto.orderNumber?.trim() || '';

    // Calcular costos a partir de los ítems si existen
    const items: WorkOrderItem[] = (dto.items || []).map((i) => ({
      itemType: i.itemType,
      description: i.description.trim(),
      quantity: Number(i.quantity) || 1,
      unitPrice: Number(i.unitPrice) || 0,
      subtotal: (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0),
    }));

    // dto.laborCost es la mano de obra base del formulario; los ítems que no son
    // repuestos (mano de obra, servicio, otro) se suman a ella. Los repuestos
    // forman partsCost. Así subtotal = laborCost + partsCost cubre todos los ítems.
    let partsCost = Number(dto.partsCost) || 0;
    let laborCost = Number(dto.laborCost) || 0;

    if (items.length > 0) {
      partsCost = items
        .filter((i) => i.itemType === 'REPUESTO')
        .reduce((sum, i) => sum + i.subtotal, 0);
      laborCost += items
        .filter((i) => i.itemType !== 'REPUESTO')
        .reduce((sum, i) => sum + i.subtotal, 0);
    }

    const subtotal = partsCost + laborCost;
    const taxAmount = Number(dto.taxAmount) || 0;
    const totalAmount = subtotal + taxAmount;
    const advancePayment = Number(dto.advancePayment) || 0;
    const pendingBalance = Math.max(0, totalAmount - advancePayment);

    const workOrder = new WorkOrder(
      null,
      companyId,
      dto.branchId ? Number(dto.branchId) : null,
      Number(dto.customerId),
      dto.customerName || null,
      dto.customerPhone || null,
      dto.customerEmail || null,
      dto.technicianId ? Number(dto.technicianId) : null,
      dto.technicianName || null,
      orderNumber,
      dto.serviceType || 'REPARACION',
      dto.priority || 'MEDIA',
      dto.status || 'RECIBIDO',
      dto.equipmentType || 'Laptop',
      dto.brand || null,
      dto.model || null,
      dto.serialNumber || null,
      dto.color || null,
      dto.securityPin || null,
      dto.accessories || null,
      dto.physicalCondition || null,
      dto.reportedFailure,
      dto.technicalDiagnosis || null,
      dto.solutionApplied || null,
      dto.entryDate ? new Date(dto.entryDate) : new Date(),
      dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : null,
      null,
      Number(dto.warrantyDays) || 30,
      laborCost,
      partsCost,
      subtotal,
      taxAmount,
      totalAmount,
      advancePayment,
      pendingBalance,
      dto.notes || null,
      false,
      undefined,
      undefined,
      items,
    );

    return this.repository.create(workOrder, items);
  }
}
