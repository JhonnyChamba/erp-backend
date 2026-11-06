import { BillingCycleGeneral } from "src/common/enum/enum";
export declare class UpdatePlansDto {
    price: string;
    billing_cycle: BillingCycleGeneral;
    description: string;
    max_users: number;
    max_branches: number;
    enabled?: boolean;
}
