import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import { WorkOrder } from '../../domain/entities/work-order.entity';

@Injectable()
export class GetWorkOrderUseCase {
  constructor(private readonly repository: WorkOrderRepository) {}

  async execute(id: number, companyId: number): Promise<WorkOrder> {
    const order = await this.repository.findById(id, companyId);
    if (!order) throw new NotFoundException('Orden de trabajo no encontrada');
    return order;
  }
}
