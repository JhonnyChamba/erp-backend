import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from 'src/modules/sub-module/infrastructure/persistence/sub-module.orm-entity';
export declare class RolesOrmEntity {
    id: number;
    code: string;
    description: string;
    company: CompanyOrmEntity;
    roleModules: RoleModuleOrmEntity[];
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
export declare class RoleModuleOrmEntity {
    id: number;
    role: RolesOrmEntity;
    module: ModuleOrmEntity;
    subModule: subModulesOrmEntity;
    has_access: boolean;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
