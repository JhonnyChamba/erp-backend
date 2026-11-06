import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare class BranchCompanyOrmEntity {
    id: number;
    code: string;
    name: string;
    address: string;
    company: CompanyOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
