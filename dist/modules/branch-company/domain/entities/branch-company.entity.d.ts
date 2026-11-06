export declare class BranchCompany {
    readonly id: number | null;
    code: string;
    name: string;
    address: string;
    companyId: number;
    enabled: boolean;
    readonly createdAt?: Date;
    readonly createdById?: number;
    constructor(id: number | null, code: string, name: string, address: string, companyId: number, enabled: boolean, createdAt?: Date, createdById?: number);
}
