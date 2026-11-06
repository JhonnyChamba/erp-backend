import { BillingCycleGeneral } from 'src/common/enum/enum';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
export declare class PlansOrmEntity {
    id: number;
    price: string;
    billing_cycle: BillingCycleGeneral;
    description: string;
    max_users: number;
    max_branches: number;
    enabled: boolean;
    createdBy: UsersOrmEntity;
    created_name: string;
    createdAt: Date;
    updatedBy: UsersOrmEntity;
    update_name: string;
    updatedAt: Date;
}
