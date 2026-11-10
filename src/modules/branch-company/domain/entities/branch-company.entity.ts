export class BranchCompany {
	constructor(
		public readonly id: number | null,
		public code: string,
		public name: string,
		public address: string,
		public companyId: number,
		public enabled: boolean,
		public readonly createdAt?: Date,
		public readonly createdById?: number,
		public emissionPoint: string = '001',
		public phone: string | null = null,
		public email: string | null = null,
		public isMatrix: boolean = false,
	) { }
}
