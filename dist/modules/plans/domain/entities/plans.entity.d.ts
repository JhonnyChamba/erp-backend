import { BillingCycleGeneral } from "src/common/enum/enum";
export declare class Plans {
    readonly id: number | null;
    price: string;
    billing_cycle: BillingCycleGeneral;
    description: string;
    max_users: number;
    max_branches: number;
    enabled: boolean;
    readonly created_name?: string;
    readonly createdAt?: Date;
    readonly createdById?: number;
    constructor(id: number | null, price: string, billing_cycle: BillingCycleGeneral, description: string, max_users: number, max_branches: number, enabled: boolean, created_name?: string, createdAt?: Date, createdById?: number);
}
