export declare class Company {
    readonly id: number | null;
    ruc: string;
    description: string;
    business_name: string;
    trade_name: string;
    enabled: boolean;
    deleted: boolean;
    readonly created_name?: string;
    readonly createdAt?: Date;
    readonly createdById?: number;
    constructor(id: number | null, ruc: string, description: string, business_name: string, trade_name: string, enabled: boolean, deleted: boolean, created_name?: string, createdAt?: Date, createdById?: number);
}
