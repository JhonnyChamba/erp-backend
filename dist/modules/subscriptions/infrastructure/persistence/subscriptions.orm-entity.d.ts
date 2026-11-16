import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { PlansOrmEntity } from 'src/modules/plans/infrastructure/persistence/plans.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { SubscriptionsModuleOrmEntity } from 'src/modules/subscriptions-module/infrastructure/persistence/subscriptions-module.orm-entity';
export declare class SubscriptionsOrmEntity {
    id: number;
    company: CompanyOrmEntity;
    plan: PlansOrmEntity;
    subscriptionModules: SubscriptionsModuleOrmEntity[];
    begin_date: Date;
    end_date: Date;
    createdBy: UsersOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
