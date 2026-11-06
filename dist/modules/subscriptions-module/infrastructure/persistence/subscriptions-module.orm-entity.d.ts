import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from 'src/modules/sub-module/infrastructure/persistence/sub-module.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
export declare class SubscriptionsModuleOrmEntity {
    id: number;
    subscriptions: SubscriptionsOrmEntity;
    module: ModuleOrmEntity;
    subModule: subModulesOrmEntity;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
