import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare class BranchCompanyOrmEntity {
    id: number;
    code: string;
    name: string;
    address: string;
    emission_point: string;
    phone: string | null;
    email: string | null;
    is_matrix: boolean;
    company: CompanyOrmEntity;
    created_by: number;
    enabled: boolean;
    deleted: boolean;
    created_at: Date;
}
