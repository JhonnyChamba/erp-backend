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
			emission_point: branch.emissionPoint,
			phone: branch.phone,
			email: branch.email,
			is_matrix: branch.isMatrix,
			logo_url: branch.logoUrl,
			company: { id: branch.companyId },
			created_by: branch.createdById,
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(companyId: number, page: number, limit: number, onlyEnabled = false): Promise<{ data: BranchCompany[]; total: number }> {
		const [branches, total] = await this.repo.findAndCount({
			where: { company: { id: companyId }, deleted: false, ...(onlyEnabled ? { enabled: true } : {}) },
			skip: (page - 1) * limit,
			take: limit,
			order: { code: 'ASC', id: 'ASC' },
		});

		return {
			data: branches.map(branch => this.toDomain(branch, companyId)),
			total,
		};
	}

	async findById(id: number, companyId: number): Promise<BranchCompany | null> {
		const branch = await this.repo.findOne({
			where: { id, company: { id: companyId }, deleted: false },
		});
		return branch ? this.toDomain(branch, companyId) : null;
	}

	async findByCode(companyId: number, code: string): Promise<BranchCompany | null> {
		const branch = await this.repo.findOne({
			where: { company: { id: companyId }, code, deleted: false },
		});
		return branch ? this.toDomain(branch, companyId) : null;
	}

	async countByCompany(companyId: number): Promise<number> {
		return this.repo.count({ where: { company: { id: companyId }, deleted: false } });
	}

	async findMatrix(companyId: number): Promise<BranchCompany | null> {
		const branch = await this.repo.findOne({ where: { company: { id: companyId }, is_matrix: true, deleted: false } });
		return branch ? this.toDomain(branch, companyId) : null;
	}

	async setMatrix(companyId: number, id: number): Promise<void> {
		await this.repo.manager.transaction(async (manager) => {
			const repo = manager.getRepository(BranchCompanyOrmEntity);
			await repo.update({ company: { id: companyId }, deleted: false, is_matrix: true }, { is_matrix: false });
			await repo.update({ id, company: { id: companyId }, deleted: false }, { is_matrix: true });
		});
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
				emission_point: branch.emissionPoint,
				phone: branch.phone,
				email: branch.email,
				is_matrix: branch.isMatrix,
				logo_url: branch.logoUrl,
			},
		);

		const updated = await this.repo.findOne({
			where: { id: branch.id, company: { id: branch.companyId } },
		});

		return this.toDomain(updated, branch.companyId);
	}

	async softDelete(id: number, companyId: number): Promise<void> {
		await this.repo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false, is_matrix: false });
	}

	private toDomain(entity: BranchCompanyOrmEntity, companyId?: number): BranchCompany {
		return new BranchCompany(
			entity.id,
			entity.code,
			entity.name,
			entity.address,
			entity.company?.id ?? companyId, // la relación no siempre se carga: se usa la empresa de la consulta
			entity.enabled,
			entity.created_at,
			undefined,
			entity.emission_point || '001',
			entity.phone ?? null,
			entity.email ?? null,
			Boolean(entity.is_matrix),
			entity.logo_url ?? null,
		);
	}
}
