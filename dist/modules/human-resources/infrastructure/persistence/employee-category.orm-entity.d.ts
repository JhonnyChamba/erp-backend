import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare class EmployeeCategoryOrmEntity {
    id: number;
    company_id: number;
    company: CompanyOrmEntity;
    name: string;
    description: string;
    default_commission_rate: number;
    active: boolean;
    deleted: boolean;
    created_at: Date;
    updated_at: Date;
}
