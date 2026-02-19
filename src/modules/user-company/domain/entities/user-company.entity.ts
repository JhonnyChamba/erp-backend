import { Company } from "src/modules/company/domain/entities/company.entity";

export class UserCompany {
	constructor(
		public readonly id: number | null,
		public usersId: number,
		public companyId: number,
		public enabled: boolean,
		public readonly createdAt?: Date,

		public company?: Company,
	) { }
}
