import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { RolesOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
export declare class UserCompanyOrmEntity {
    id: number;
    user: UsersOrmEntity;
    company: CompanyOrmEntity;
    role: RolesOrmEntity;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
