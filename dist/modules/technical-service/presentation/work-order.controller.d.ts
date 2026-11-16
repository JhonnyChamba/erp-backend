import { CreateWorkOrderUseCase } from '../application/use-cases/create-work-order.use-case';
import { ListWorkOrdersUseCase } from '../application/use-cases/list-work-orders.use-case';
import { GetWorkOrderUseCase } from '../application/use-cases/get-work-order.use-case';
import { UpdateWorkOrderUseCase } from '../application/use-cases/update-work-order.use-case';
import { UpdateWorkOrderStatusUseCase } from '../application/use-cases/update-work-order-status.use-case';
import { DeleteWorkOrderUseCase } from '../application/use-cases/delete-work-order.use-case';
import { CreateWorkOrderDto } from '../application/dto/create-work-order.dto';
import { UpdateWorkOrderDto } from '../application/dto/update-work-order.dto';
import { ListWorkOrdersDto } from '../application/dto/list-work-orders.dto';
import { UpdateWorkOrderStatusDto } from '../application/dto/update-work-order-status.dto';
import { WorkOrderRepository } from '../domain/repositories/work-order.repository';
export declare class WorkOrderController {
    private readonly createUseCase;
    private readonly listUseCase;
    private readonly getUseCase;
    private readonly updateUseCase;
    private readonly updateStatusUseCase;
    private readonly deleteUseCase;
    private readonly repository;
    constructor(createUseCase: CreateWorkOrderUseCase, listUseCase: ListWorkOrdersUseCase, getUseCase: GetWorkOrderUseCase, updateUseCase: UpdateWorkOrderUseCase, updateStatusUseCase: UpdateWorkOrderStatusUseCase, deleteUseCase: DeleteWorkOrderUseCase, repository: WorkOrderRepository);
    create(dto: CreateWorkOrderDto, req: any): Promise<import("../domain/entities/work-order.entity").WorkOrder>;
    list(query: ListWorkOrdersDto, req: any): Promise<{
        data: import("../domain/entities/work-order.entity").WorkOrder[];
        total: number;
        kpis: import("../domain/repositories/work-order.repository").WorkOrderKpis;
    }>;
    getNextNumber(req: any): Promise<{
        orderNumber: string;
    }>;
    get(id: number, req: any): Promise<import("../domain/entities/work-order.entity").WorkOrder>;
    update(id: number, dto: UpdateWorkOrderDto, req: any): Promise<import("../domain/entities/work-order.entity").WorkOrder>;
    updateStatus(id: number, dto: UpdateWorkOrderStatusDto, req: any): Promise<import("../domain/entities/work-order.entity").WorkOrder>;
    delete(id: number, req: any): Promise<void>;
}
