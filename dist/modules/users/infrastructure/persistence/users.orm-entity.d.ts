import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
export declare class UsersOrmEntity {
    id: number;
    company: CompanyOrmEntity;
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
    created_at: Date;
}
