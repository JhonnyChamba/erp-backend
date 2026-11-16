import { Repository } from 'typeorm';
import { WorkOrderRepository, ListWorkOrdersFilters, WorkOrderKpis } from '../../domain/repositories/work-order.repository';
import { WorkOrder, WorkOrderItem } from '../../domain/entities/work-order.entity';
import { WorkOrderOrmEntity } from '../persistence/work-order.orm-entity';
import { WorkOrderItemOrmEntity } from '../persistence/work-order-item.orm-entity';
export declare class WorkOrderRepositoryImpl implements WorkOrderRepository {
    private readonly repo;
    private readonly itemRepo;
    constructor(repo: Repository<WorkOrderOrmEntity>, itemRepo: Repository<WorkOrderItemOrmEntity>);
    private toDomain;
    create(entity: WorkOrder, items?: WorkOrderItem[]): Promise<WorkOrder>;
    findById(id: number, companyId: number): Promise<WorkOrder | null>;
    findByCompany(companyId: number, filters?: ListWorkOrdersFilters): Promise<{
        data: WorkOrder[];
        total: number;
        kpis: WorkOrderKpis;
    }>;
    update(entity: WorkOrder, items?: WorkOrderItem[]): Promise<WorkOrder>;
    updateStatus(id: number, companyId: number, status: string, technicalDiagnosis?: string, solutionApplied?: string, realDeliveryDate?: Date): Promise<WorkOrder>;
    delete(id: number, companyId: number): Promise<void>;
    generateNextOrderNumber(companyId: number): Promise<string>;
}
