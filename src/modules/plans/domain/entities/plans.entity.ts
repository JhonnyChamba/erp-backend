import { BillingCycleGeneral } from "src/common/enum/enum";

export class Plans {
	constructor(
		public readonly id: number | null,
		public price: string,
		public billing_cycle: BillingCycleGeneral,
		public description: string,
		public max_users: number,
		public max_branches: number,
		public enabled: boolean,
		public readonly created_name?: string,
		public readonly createdAt?: Date,
		public readonly createdById?: number,
	) { }
}