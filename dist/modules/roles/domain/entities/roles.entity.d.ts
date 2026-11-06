export declare class Roles {
    readonly id: number | null;
    code: string;
    description: string;
    companyId: number;
    enabled: boolean;
    readonly createdAt?: Date;
    readonly createdById?: number;
    constructor(id: number | null, code: string, description: string, companyId: number, enabled: boolean, createdAt?: Date, createdById?: number);
}
