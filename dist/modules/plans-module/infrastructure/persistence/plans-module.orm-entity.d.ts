import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { PlansOrmEntity } from 'src/modules/plans/infrastructure/persistence/plans.orm-entity';
export declare class PlansModulesOrmEntity {
    id: number;
    plans: PlansOrmEntity;
    module: ModuleOrmEntity;
    created_at: Date;
}
