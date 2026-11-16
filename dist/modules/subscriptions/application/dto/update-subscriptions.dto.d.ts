export declare class UpdateSubscriptionsDto {
    companyId: number;
    planId?: number;
    begin_date?: Date;
    end_date?: Date;
    enabled?: boolean;
    moduleIds?: number[];
    subModuleIds?: number[];
}
