export declare class CreateEmissionPointDto {
    description: string;
    branch_id: number;
    serie: string;
    initial_correlative?: number;
}
export declare class UpdateEmissionPointDto {
    description?: string;
    branch_id?: number;
    serie?: string;
    enabled?: boolean;
}
export declare class UpdateSequenceDto {
    correlative: number;
}
