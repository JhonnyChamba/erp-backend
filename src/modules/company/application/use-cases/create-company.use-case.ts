import { CompanyRepository } from '../../domain/repositories/company.repository';
import { Company } from '../../domain/entities/company.entity';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateCompanyUseCase {
	constructor(private readonly repository: CompanyRepository) { }

	async execute(dto: CreateCompanyDto, user: any) {
		const company = new Company(
			null,
			dto.ruc,
			dto.description,
			dto.business_name,
			dto.trade_name,
			true,
			undefined,
			user.user_name, // 🔥 siempre del token
			user.user_id, // 🔥 siempre del token
		);

		return this.repository.create(company);
	}

}
