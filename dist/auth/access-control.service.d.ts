import { Repository } from 'typeorm';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from 'src/modules/sub-module/infrastructure/persistence/sub-module.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
import { RolesOrmEntity, RoleModuleOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
export interface MenuSubModuleItem {
    id: number;
    code: string;
    description: string;
    icon: string;
    url: string;
}
export interface MenuModuleItem {
    id: number;
    code: string;
    description: string;
    icon: string;
    children: MenuSubModuleItem[];
}
export interface UserCompanyAccessResponse {
    companyId: number;
    isSuperAdmin: boolean;
    isMultiCompany: boolean;
    roleId: number | null;
    roleCode: string | null;
    roleName: string | null;
    moduleCodes: string[];
    subModuleCodes: string[];
    allowedUrls: string[];
    menu: MenuModuleItem[];
}
export declare class AccessControlService {
    private readonly moduleRepo;
    private readonly subModuleRepo;
    private readonly subscriptionsRepo;
    private readonly rolesRepo;
    private readonly roleModuleRepo;
    private readonly userCompanyRepo;
    private readonly usersRepo;
    private static cache;
    private static readonly CACHE_TTL_MS;
    constructor(moduleRepo: Repository<ModuleOrmEntity>, subModuleRepo: Repository<subModulesOrmEntity>, subscriptionsRepo: Repository<SubscriptionsOrmEntity>, rolesRepo: Repository<RolesOrmEntity>, roleModuleRepo: Repository<RoleModuleOrmEntity>, userCompanyRepo: Repository<UserCompanyOrmEntity>, usersRepo: Repository<UsersOrmEntity>);
    static clearCache(companyId?: number, userId?: number): void;
    getUserCompanyAccess(userPayload: any, companyId: number, forceRefresh?: boolean): Promise<UserCompanyAccessResponse>;
}
