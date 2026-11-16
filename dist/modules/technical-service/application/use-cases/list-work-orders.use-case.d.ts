import { WorkOrderRepository, ListWorkOrdersFilters, WorkOrderKpis } from '../../domain/repositories/work-order.repository';
import { WorkOrder } from '../../domain/entities/work-order.entity';
export declare class ListWorkOrdersUseCase {
    private readonly repository;
    constructor(repository: WorkOrderRepository);
    execute(companyId: number, filters?: ListWorkOrdersFilters): Promise<{
        data: WorkOrder[];
        total: number;
        kpis: WorkOrderKpis;
    }>;
}
