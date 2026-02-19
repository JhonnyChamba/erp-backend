import { BranchCompanyRepository } from '../../domain/repositories/branch-company.repository';
import { BranchCompanyOrmEntity } from '../persistence/branch-company.orm-entity';
import { BranchCompany } from '../../domain/entities/branch-company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class BranchCompanyRepositoryImpl implements BranchCompanyRepository {

	constructor(
		@InjectRepository(BranchCompanyOrmEntity)
		private readonly repo: Repository<BranchCompanyOrmEntity>,
	) { }

	async create(branch: BranchCompany): Promise<BranchCompany> {

		const entity = this.repo.create({
			code: branch.code,
			name: branch.name,
			address: branch.address,
			enabled: branch.enabled,

			company: { id: branch.companyId },
			created_by: branch.createdById
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(companyId: number, page: number, limit: number): Promise<{ data: BranchCompany[]; total: number }> {

		const [branches, total] = await this.repo.findAndCount({
			where: { company: { id: companyId }, deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: branches.map(branch => this.toDomain(branch)),
			total,
		};
	}

	async findById(id: number, companyId: number): Promise<BranchCompany | null> {

		const branch = await this.repo.findOne({
			where: {
				id,
				company: { id: companyId },
				deleted: false,
			},
		});

		return branch ? this.toDomain(branch) : null;
	}

	async update(branch: BranchCompany): Promise<BranchCompany> {

		await this.repo.update(
			{
				id: branch.id,
				company: { id: branch.companyId }, // multi-tenant seguro
			},
			{
				code: branch.code,
				name: branch.name,
				address: branch.address,
				enabled: branch.enabled,
			},
		);

		const updated = await this.repo.findOne({
			where: {
				id: branch.id,
				company: { id: branch.companyId },
			},
		});

		return this.toDomain(updated);
	}

	private toDomain(entity: BranchCompanyOrmEntity): BranchCompany {
		return new BranchCompany(
			entity.id,
			entity.code,
			entity.name,
			entity.address,
			entity.company?.id, // ahora viene de relación
			entity.enabled,
			entity.created_at,
		);
	}
}