import { WorkOrderOrmEntity } from './work-order.orm-entity';
export declare class WorkOrderItemOrmEntity {
    id: number;
    work_order_id: number;
    work_order: WorkOrderOrmEntity;
    item_type: 'SERVICIO' | 'REPUESTO';
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}
