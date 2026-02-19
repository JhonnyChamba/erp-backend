export class subModules {
	constructor(
		public readonly id: number | null,
		public code: string,
		public desc_icon: string,
		public description: string,
		public url_desc: string,
		public moduleId: number,
		public enabled: boolean,
		public readonly createdAt?: Date,
		public readonly createdById?: number,
	) { }
}