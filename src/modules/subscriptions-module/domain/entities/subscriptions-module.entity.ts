export class SubscriptionsModule {
	constructor(
		public readonly id: number | null,
		public subscriptionId: number,
		public moduleId: number,
		public readonly createdAt?: Date,
	) { }
}