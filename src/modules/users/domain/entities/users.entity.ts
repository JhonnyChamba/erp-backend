export interface UserCompanyRoleItem {
	companyId: number;
	roleId?: number | null;
	roleName?: string | null;
}

export class Users {
	constructor(
		public readonly id: number | null,
		public num_document: string,
		public name_user: string,
		public last_name_user: string,
		public email: string,
		public password: string,
		public companyId: number,
		public developer: boolean,
		public multi_company: boolean,
		public enabled: boolean,
		public deleted: boolean,
		public readonly createdAt?: Date,
		public theme_color: string = 'Blue_Theme',
		public super_admin: boolean = false,
		public companyIds: number[] = [],
		public roleId?: number | null,
		public roleName?: string | null,
		public companyRoles: UserCompanyRoleItem[] = [],
		public birth_date: string | null = null,
	) { }
}
