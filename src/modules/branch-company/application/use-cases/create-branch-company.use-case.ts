import { BranchCompanyRepository } from '../../domain/repositories/branch-company.repository';
import { BranchCompany } from '../../domain/entities/branch-company.entity';
import { CreateBranchCompanyDto } from '../dto/create-branch-company.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateBranchCompanyUseCase {
	constructor(private readonly repository: BranchCompanyRepository) { }

	async execute(dto: CreateBranchCompanyDto, user: any) {
		const branch = new BranchCompany(
			null,
			dto.code,
			dto.name,
			dto.address,
			dto.companyId,
			true,
			undefined,
			user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(branch);
	}

}
