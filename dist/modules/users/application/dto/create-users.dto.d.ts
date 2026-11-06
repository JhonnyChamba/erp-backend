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
    theme_color?: string;
}
