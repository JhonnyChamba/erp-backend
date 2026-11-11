export declare class CreateTaxDto {
    code: string;
    percentage: number;
    description: string;
    status?: string;
    is_default?: boolean;
}
export declare class UpdateTaxDto {
    code?: string;
    percentage?: number;
    description?: string;
    status?: string;
    is_default?: boolean;
}
