export declare class CreateUsersDto {
    companyId: number;
    num_document: string;
    name_user: string;
    last_name_user: string;
    email: string;
    password: string;
    developer?: boolean;
    super_admin?: boolean;
    multi_company?: boolean;
    companyIds?: number[];
    roleId?: number | null;
    companyRoles?: {
        companyId: number;
        roleId?: number | null;
    }[];
    theme_color?: string;
    birth_date?: string | null;
    photo_url?: string | null;
}
