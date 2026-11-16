import { WorkOrder, WorkOrderItem } from '../entities/work-order.entity';

export interface WorkOrderKpis {
  total: number;
  received: number;
  inProgress: number; // EN_DIAGNOSTICO, EN_REPARACION, EN_ESPERA_REPUESTOS
  readyToDeliver: number; // LISTO_ENTREGA
  delivered: number; // ENTREGADO
  totalPendingAmount: number;
}

export interface ListWorkOrdersFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  priority?: string;
  branchId?: number;
  technicianId?: number;
  startDate?: string;
  endDate?: string;
}

export abstract class WorkOrderRepository {
  abstract create(entity: WorkOrder, items?: WorkOrderItem[]): Promise<WorkOrder>;
  abstract findById(id: number, companyId: number): Promise<WorkOrder | null>;
  abstract findByCompany(
    companyId: number,
    filters?: ListWorkOrdersFilters,
  ): Promise<{ data: WorkOrder[]; total: number; kpis: WorkOrderKpis }>;
  abstract update(entity: WorkOrder, items?: WorkOrderItem[]): Promise<WorkOrder>;
  abstract updateStatus(
    id: number,
    companyId: number,
    status: string,
    technicalDiagnosis?: string,
    solutionApplied?: string,
    realDeliveryDate?: Date,
  ): Promise<WorkOrder>;
  abstract delete(id: number, companyId: number): Promise<void>;
  abstract generateNextOrderNumber(companyId: number): Promise<string>;
}
