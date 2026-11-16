import { AppointmentOrmEntity } from './appointment.orm-entity';
import { InventoryServiceOrmEntity } from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
export declare class AppointmentItemOrmEntity {
    id: number;
    appointment_id: number;
    appointment: AppointmentOrmEntity;
    service_id: number | null;
    service: InventoryServiceOrmEntity | null;
    service_name: string;
    duration_minutes: number;
    price: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    notes: string | null;
}
