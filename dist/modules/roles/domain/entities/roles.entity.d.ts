export interface RoleAccessDetail {
    moduleId?: number | null;
    subModuleId?: number | null;
    hasAccess: boolean;
}
export declare class Roles {
    readonly id: number | null;
    code: string;
    description: string;
    companyId: number;
    enabled: boolean;
    readonly createdAt?: Date;
    readonly createdById?: number;
    moduleIds?: number[];
    subModuleIds?: number[];
    details?: RoleAccessDetail[];
    constructor(id: number | null, code: string, description: string, companyId: number, enabled: boolean, createdAt?: Date, createdById?: number, moduleIds?: number[], subModuleIds?: number[], details?: RoleAccessDetail[]);
}
