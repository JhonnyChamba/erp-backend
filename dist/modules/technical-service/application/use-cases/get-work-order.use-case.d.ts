import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import { WorkOrder } from '../../domain/entities/work-order.entity';
export declare class GetWorkOrderUseCase {
    private readonly repository;
    constructor(repository: WorkOrderRepository);
    execute(id: number, companyId: number): Promise<WorkOrder>;
}
