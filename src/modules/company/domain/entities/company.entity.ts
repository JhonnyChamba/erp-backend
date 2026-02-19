export class Company {
	constructor(
		public readonly id: number | null,
		public ruc: string,
		public description: string,
		public business_name: string,
		public trade_name: string,
		public enabled: boolean,
		public deleted: boolean,
		public readonly created_name?: string,
		public readonly createdAt?: Date,
		public readonly createdById?: number,
	) { }
}