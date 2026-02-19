import { UserCompanyRepository } from '../../domain/repositories/user-company.repository';
import { UserCompany } from '../../domain/entities/user-company.entity';
import { CreateUserCompanyDto } from '../dto/create-user-company.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserCompanyUseCase {
	constructor(private readonly repository: UserCompanyRepository) { }

	async execute(dto: CreateUserCompanyDto, user: any) {
		const branch = new UserCompany(
			null,
			dto.usersId,
			dto.companyId,
			true,
			undefined,
			// user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(branch);
	}

}
