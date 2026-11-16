import { Repository, DataSource, EntityManager } from 'typeorm';
import { EmissionPointOrmEntity, EmissionPointSequenceOrmEntity } from '../infrastructure/persistence/emission-point.orm-entity';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
import { CreateEmissionPointDto, UpdateEmissionPointDto, UpdateSequenceDto } from './dto/emission-point.dto';
export declare class EmissionPointService {
    private readonly pointRepo;
    private readonly sequenceRepo;
    private readonly branchRepo;
    private readonly dataSource;
    constructor(pointRepo: Repository<EmissionPointOrmEntity>, sequenceRepo: Repository<EmissionPointSequenceOrmEntity>, branchRepo: Repository<BranchCompanyOrmEntity>, dataSource: DataSource);
    private normalizeSerie;
    listEmissionPoints(companyId: number, branchId?: number): Promise<EmissionPointOrmEntity[]>;
    getEmissionPointById(id: number, companyId: number): Promise<EmissionPointOrmEntity>;
    createEmissionPoint(companyId: number, dto: CreateEmissionPointDto, userId?: number): Promise<EmissionPointOrmEntity>;
    updateEmissionPoint(id: number, companyId: number, dto: UpdateEmissionPointDto): Promise<EmissionPointOrmEntity>;
    deleteEmissionPoint(id: number, companyId: number): Promise<{
        deleted: boolean;
        id: number;
    }>;
    updateSequenceCorrelative(sequenceId: number, companyId: number, dto: UpdateSequenceDto): Promise<EmissionPointSequenceOrmEntity>;
    getNextSequential(companyId: number, branchId: number, emissionPointId?: number, serieParam?: string, documentType?: string): Promise<{
        establishment: string;
        emission_point: string;
        emission_point_id: number;
        emission_point_description: string;
        document_type: string;
        current_correlative: number;
        next_correlative: number;
        sequential: string;
        full_invoice_number: string;
    }>;
    syncAndIncrementCorrelative(companyId: number, branchId: number, serie: string, sequentialNumber: number, documentType?: string, externalManager?: EntityManager): Promise<void>;
}
