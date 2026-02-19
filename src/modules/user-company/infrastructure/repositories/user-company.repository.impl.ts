import { UserCompanyRepository } from '../../domain/repositories/user-company.repository';
import { UserCompanyOrmEntity } from '../persistence/user-company.orm-entity';
import { UserCompany } from '../../domain/entities/user-company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Company } from 'src/modules/company/domain/entities/company.entity';

@Injectable()
export class UserCompanyRepositoryImpl implements UserCompanyRepository {

	constructor(
		@InjectRepository(UserCompanyOrmEntity)
		private readonly repo: Repository<UserCompanyOrmEntity>,
	) { }

	async create(company: UserCompany): Promise<UserCompany> {
		const entity = this.repo.create({
			enabled: company.enabled,
			user: { id: company.usersId },
			company: { id: company.companyId },
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(usersId: number | undefined, page: number, limit: number): Promise<{ data: UserCompany[]; total: number }> {

		const query = this.repo
			.createQueryBuilder('userCompany')
			.innerJoinAndSelect('userCompany.company', 'company')
			.andWhere('userCompany.deleted = false');

		if (usersId) {
			query.andWhere('userCompany.user_id = :userId', { userId: usersId });
		}

		const [companies, total] = await query
			.orderBy('userCompany.created_at', 'DESC')
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount();

		// console.log(companies);

		return { data: companies.map(company => this.toDomain(company)), total };
	}

	async findById(id: number, usersId: number): Promise<UserCompany | null> {
		const company = await this.repo.findOne({
			where: {
				id,
				user: { id: usersId },
				deleted: false,
			},
		});

		return company ? this.toDomain(company) : null;
	}

	async update(company: UserCompany): Promise<UserCompany> {
		await this.repo.update(
			{
				id: company.id,
				user: { id: company.usersId }, // multi-tenant seguro
			},
			{ enabled: company.enabled },
		);

		const updated = await this.repo.findOne({
			where: {
				id: company.id,
				user: { id: company.usersId },
			},
		});

		return this.toDomain(updated);
	}

	private toDomain(entity: UserCompanyOrmEntity): UserCompany {
		return new UserCompany(
			entity.id,
			entity.user?.id ?? null,
			entity.company?.id ?? null,
			entity.enabled,
			entity.created_at,
			entity.company
				? new Company(
					entity.company.id,
					entity.company.ruc,
					entity.company.description,
					entity.company.business_name,
					entity.company.trade_name,
					entity.company.enabled,
					entity.company.deleted,
					entity.company.created_name,
					entity.company.createdAt,
					entity.company.createdBy?.id
				)
				: undefined,
		);
	}

}