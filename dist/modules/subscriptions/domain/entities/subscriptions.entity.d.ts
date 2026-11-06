export declare class Subscriptions {
    readonly id: number | null;
    begin_date: Date;
    end_date: Date;
    planId: number;
    companyId: number;
    enabled: boolean;
    readonly createdAt?: Date;
    readonly createdById?: number;
    moduleIds?: number[];
    subModuleIds?: number[];
    constructor(id: number | null, begin_date: Date, end_date: Date, planId: number, companyId: number, enabled: boolean, createdAt?: Date, createdById?: number, moduleIds?: number[], subModuleIds?: number[]);
}
