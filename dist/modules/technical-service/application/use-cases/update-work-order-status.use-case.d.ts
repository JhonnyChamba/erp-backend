import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { UpdateWorkOrderStatusDto } from '../dto/update-work-order-status.dto';
export declare class UpdateWorkOrderStatusUseCase {
    private readonly repository;
    constructor(repository: WorkOrderRepository);
    execute(id: number, companyId: number, dto: UpdateWorkOrderStatusDto): Promise<WorkOrder>;
}
