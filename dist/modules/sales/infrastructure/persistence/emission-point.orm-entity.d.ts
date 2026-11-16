import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
export declare class EmissionPointOrmEntity {
    id: number;
    company: CompanyOrmEntity;
    branch: BranchCompanyOrmEntity;
    description: string;
    serie: string;
    enabled: boolean;
    deleted: boolean;
    created_by: number | null;
    sequences: EmissionPointSequenceOrmEntity[];
    created_at: Date;
    updated_at: Date;
}
export declare class EmissionPointSequenceOrmEntity {
    id: number;
    company: CompanyOrmEntity;
    emission_point: EmissionPointOrmEntity;
    document_type: string;
    document_code: string;
    serie: string;
    correlative: number;
    enabled: boolean;
    created_at: Date;
    updated_at: Date;
}
