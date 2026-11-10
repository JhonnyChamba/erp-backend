import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { RolesOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
export declare class UsersOrmEntity {
    id: number;
    company: CompanyOrmEntity;
    role: RolesOrmEntity;
    userCompanies: UserCompanyOrmEntity[];
    num_document: string;
    name_user: string;
    last_name_user: string;
    email: string;
    password: string;
    developer: boolean;
    super_admin: boolean;
    multi_company: boolean;
    enabled: boolean;
    deleted: boolean;
    theme_color: string;
    birth_date: string | null;
    created_at: Date;
}
