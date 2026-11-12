import { Repository } from 'typeorm';
import { CompanyOrmEntity } from '../../infrastructure/persistence/company.orm-entity';
import { CertInspectionResult } from '../cert-inspector.util';
export declare class InspectCertDto {
    cert_p12_base64?: string;
    cert_password?: string;
}
export declare class InspectCertUseCase {
    private readonly repo;
    constructor(repo: Repository<CompanyOrmEntity>);
    execute(companyId: number | null, dto: InspectCertDto): Promise<CertInspectionResult>;
}
