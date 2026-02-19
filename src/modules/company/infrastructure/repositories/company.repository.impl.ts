import { CompanyRepository } from '../../domain/repositories/company.repository';
import { CompanyOrmEntity } from '../persistence/company.orm-entity';
import { Company } from '../../domain/entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyRepositoryImpl implements CompanyRepository {

	constructor(
		@InjectRepository(CompanyOrmEntity)
		private readonly repo: Repository<CompanyOrmEntity>,
	) { }

	async create(company: Company): Promise<Company> {
		const entity = this.repo.create({
			ruc: company.ruc,
			description: company.description,
			business_name: company.business_name,
			trade_name: company.trade_name,
			enabled: company.enabled,
			created_name: company.created_name,
			createdBy: { id: company.createdById }
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(page: number, limit: number): Promise<{ data: Company[]; total: number }> {

		const [branches, total] = await this.repo.findAndCount({
			where: { deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { createdAt: 'DESC' },
		});

		return {
			data: branches.map(company => this.toDomain(company)),
			total,
		};
	}

	async findById(id: number): Promise<Company | null> {

		const company = await this.repo.findOne({
			where: {
				id,
				deleted: false,
			},
		});

		return company ? this.toDomain(company) : null;
	}

	async update(company: Company): Promise<Company> {

		await this.repo.update(
			{ id: company.id },
			{
				ruc: company.ruc,
				description: company.description,
				business_name: company.business_name,
				trade_name: company.trade_name,
				enabled: company.enabled,
			},
		);

		const updated = await this.repo.findOne({ where: { id: company.id } });

		return this.toDomain(updated);
	}

	private toDomain(entity: CompanyOrmEntity): Company {
		return new Company(
			entity.id,
			entity.ruc,
			entity.description,
			entity.business_name,
			entity.trade_name,
			entity.enabled,
			entity.deleted,
			entity.created_name,
			entity.createdAt,
		);
	}
}