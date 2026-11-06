export interface RoleAccessDetail {
	moduleId?: number | null;
	subModuleId?: number | null;
	hasAccess: boolean;
}

export class Roles {
	constructor(
		public readonly id: number | null,
		public code: string,
		public description: string,
		public companyId: number,
		public enabled: boolean,
		public readonly createdAt?: Date,
		public readonly createdById?: number,
		public moduleIds?: number[],
		public subModuleIds?: number[],
		public details?: RoleAccessDetail[],
	) { }
}