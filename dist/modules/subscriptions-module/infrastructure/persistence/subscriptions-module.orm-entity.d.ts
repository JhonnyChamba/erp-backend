import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
export declare class SubscriptionsModuleOrmEntity {
    id: number;
    subscriptions: SubscriptionsOrmEntity;
    module: ModuleOrmEntity;
    created_at: Date;
}
