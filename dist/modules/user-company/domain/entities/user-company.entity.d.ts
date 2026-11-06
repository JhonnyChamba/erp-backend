import { Company } from "src/modules/company/domain/entities/company.entity";
export declare class UserCompany {
    readonly id: number | null;
    usersId: number;
    companyId: number;
    enabled: boolean;
    readonly createdAt?: Date;
    company?: Company;
    constructor(id: number | null, usersId: number, companyId: number, enabled: boolean, createdAt?: Date, company?: Company);
}
