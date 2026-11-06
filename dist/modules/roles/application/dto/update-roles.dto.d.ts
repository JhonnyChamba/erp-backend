export declare class UpdateRolesDto {
    companyId?: number;
    code?: string;
    description?: string;
    name?: string;
    address?: string;
    enabled?: boolean;
    moduleIds?: number[];
    subModuleIds?: number[];
    details?: {
        moduleId?: number | null;
        subModuleId?: number | null;
        hasAccess: boolean;
    }[];
}
