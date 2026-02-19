export class PlansModules {
	constructor(
		public readonly id: number | null,
		public planId: number,
		public moduleId: number,
		public readonly createdAt?: Date,
	) { }
}