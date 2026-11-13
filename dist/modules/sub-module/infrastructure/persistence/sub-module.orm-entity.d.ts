import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
export declare class subModulesOrmEntity {
    id: number;
    code: string;
    desc_icon: string;
    description: string;
    url_desc: string;
    order_index: number;
    module: ModuleOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
