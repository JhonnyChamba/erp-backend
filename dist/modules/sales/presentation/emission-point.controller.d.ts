import { EmissionPointService } from '../application/emission-point.service';
import { CreateEmissionPointDto, UpdateEmissionPointDto, UpdateSequenceDto } from '../application/dto/emission-point.dto';
export declare class EmissionPointController {
    private readonly emissionPointService;
    constructor(emissionPointService: EmissionPointService);
    private resolveCompanyId;
    findAll(branchIdQuery: string, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/emission-point.orm-entity").EmissionPointOrmEntity[]>;
    getNextSequential(branchIdQuery: string, emissionPointIdQuery: string, serieQuery: string, documentTypeQuery: string, companyIdQuery: string, req: any): Promise<{
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
    findOne(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/emission-point.orm-entity").EmissionPointOrmEntity>;
    create(dto: CreateEmissionPointDto, req: any): Promise<import("../infrastructure/persistence/emission-point.orm-entity").EmissionPointOrmEntity>;
    update(id: number, dto: UpdateEmissionPointDto, req: any): Promise<import("../infrastructure/persistence/emission-point.orm-entity").EmissionPointOrmEntity>;
    delete(id: number, companyIdQuery: string, req: any): Promise<{
        deleted: boolean;
        id: number;
    }>;
    updateSequence(sequenceId: number, dto: UpdateSequenceDto, req: any): Promise<import("../infrastructure/persistence/emission-point.orm-entity").EmissionPointSequenceOrmEntity>;
}
