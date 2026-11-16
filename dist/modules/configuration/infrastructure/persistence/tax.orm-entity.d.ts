import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare class TaxOrmEntity {
    id: number;
    company_id: number;
    company: CompanyOrmEntity;
    code: string;
    percentage: number;
    description: string;
    status: string;
    is_default: boolean;
    deleted: boolean;
    created_at: Date;
    updated_at: Date;
}
