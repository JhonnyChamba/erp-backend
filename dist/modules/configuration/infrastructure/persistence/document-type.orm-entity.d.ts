import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare class DocumentTypeOrmEntity {
    id: number;
    company_id: number;
    company: CompanyOrmEntity;
    name: string;
    type: string;
    code: string;
    status: string;
    deleted: boolean;
    created_at: Date;
    updated_at: Date;
}
