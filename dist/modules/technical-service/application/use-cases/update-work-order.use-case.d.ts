import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { UpdateWorkOrderDto } from '../dto/update-work-order.dto';
export declare class UpdateWorkOrderUseCase {
    private readonly repository;
    constructor(repository: WorkOrderRepository);
    execute(id: number, companyId: number, dto: UpdateWorkOrderDto): Promise<WorkOrder>;
}
