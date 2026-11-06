export interface UserCompanyRoleItem {
    companyId: number;
    roleId?: number | null;
    roleName?: string | null;
}
export declare class Users {
    readonly id: number | null;
    num_document: string;
    name_user: string;
    last_name_user: string;
    email: string;
    password: string;
    companyId: number;
    developer: boolean;
    multi_company: boolean;
    enabled: boolean;
    deleted: boolean;
    readonly createdAt?: Date;
    theme_color: string;
    super_admin: boolean;
    companyIds: number[];
    roleId?: number | null;
    roleName?: string | null;
    companyRoles: UserCompanyRoleItem[];
    constructor(id: number | null, num_document: string, name_user: string, last_name_user: string, email: string, password: string, companyId: number, developer: boolean, multi_company: boolean, enabled: boolean, deleted: boolean, createdAt?: Date, theme_color?: string, super_admin?: boolean, companyIds?: number[], roleId?: number | null, roleName?: string | null, companyRoles?: UserCompanyRoleItem[]);
}
