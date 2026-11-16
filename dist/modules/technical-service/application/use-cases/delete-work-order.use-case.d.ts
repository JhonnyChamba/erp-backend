import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
export declare class DeleteWorkOrderUseCase {
    private readonly repository;
    constructor(repository: WorkOrderRepository);
    execute(id: number, companyId: number): Promise<void>;
}
