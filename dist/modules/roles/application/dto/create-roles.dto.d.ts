export declare class CreateRolesDto {
    companyId: number;
    code?: string;
    description: string;
    address?: string;
    moduleIds?: number[];
    subModuleIds?: number[];
    details?: {
        moduleId?: number | null;
        subModuleId?: number | null;
        hasAccess: boolean;
    }[];
}
