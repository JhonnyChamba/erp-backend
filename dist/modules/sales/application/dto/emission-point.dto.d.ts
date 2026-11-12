export declare class CreateEmissionPointDto {
    companyId?: number;
    description: string;
    branch_id: number;
    serie: string;
    initial_correlative?: number;
}
export declare class UpdateEmissionPointDto {
    companyId?: number;
    description?: string;
    branch_id?: number;
    serie?: string;
    enabled?: boolean;
}
export declare class UpdateSequenceDto {
    companyId?: number;
    correlative: number;
}
