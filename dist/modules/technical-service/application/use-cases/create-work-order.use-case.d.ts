import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { CreateWorkOrderDto } from '../dto/create-work-order.dto';
export declare class CreateWorkOrderUseCase {
    private readonly repository;
    constructor(repository: WorkOrderRepository);
    execute(dto: CreateWorkOrderDto, currentUser?: any): Promise<WorkOrder>;
}
