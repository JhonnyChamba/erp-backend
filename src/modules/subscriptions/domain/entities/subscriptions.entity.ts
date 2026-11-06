export class Subscriptions {
	constructor(
		public readonly id: number | null,
		public begin_date: Date,
		public end_date: Date,
		public planId: number,
		public companyId: number,
		public enabled: boolean,
		public readonly createdAt?: Date,
		public readonly createdById?: number,
		public moduleIds?: number[],
		public subModuleIds?: number[],
	) { }
}