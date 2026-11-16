import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';

@Injectable()
export class DeleteWorkOrderUseCase {
  constructor(private readonly repository: WorkOrderRepository) {}

  async execute(id: number, companyId: number): Promise<void> {
    const existing = await this.repository.findById(id, companyId);
    if (!existing) throw new NotFoundException('Orden de trabajo no encontrada');
    await this.repository.delete(id, companyId);
  }
}
