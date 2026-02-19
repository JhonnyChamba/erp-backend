export class PermissionsTemplates {
	constructor(
		public readonly id: number | null,
		public code: string,
		public description: string,
		public enabled: boolean,
		public readonly createdAt?: Date,
		public readonly createdById?: number,
	) { }
}