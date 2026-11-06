import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
export declare class UserCompanyOrmEntity {
    id: number;
    user: UsersOrmEntity;
    company: CompanyOrmEntity;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
