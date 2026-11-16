import { Injectable } from '@nestjs/common';
import { WorkOrderRepository, ListWorkOrdersFilters, WorkOrderKpis } from '../../domain/repositories/work-order.repository';
import { WorkOrder } from '../../domain/entities/work-order.entity';

@Injectable()
export class ListWorkOrdersUseCase {
  constructor(private readonly repository: WorkOrderRepository) {}

  async execute(
    companyId: number,
    filters?: ListWorkOrdersFilters,
  ): Promise<{ data: WorkOrder[]; total: number; kpis: WorkOrderKpis }> {
    return this.repository.findByCompany(companyId, filters);
  }
}
