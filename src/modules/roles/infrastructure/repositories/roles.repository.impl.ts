import { RolesRepository } from '../../domain/repositories/roles.repository';
import { RolesOrmEntity } from '../persistence/roles.orm-entity';
import { Roles } from '../../domain/entities/roles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class RolesRepositoryImpl implements RolesRepository {

	constructor(
		@InjectRepository(RolesOrmEntity)
		private readonly repo: Repository<RolesOrmEntity>,
	) { }

	async create(roles: Roles): Promise<Roles> {

		const entity = this.repo.create({
			code: roles.code,
			description: roles.description,
			enabled: roles.enabled,

			company: { id: roles.companyId },
			created_by: roles.createdById
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(companyId: number, page: number, limit: number): Promise<{ data: Roles[]; total: number }> {

		const [branches, total] = await this.repo.findAndCount({
			where: { company: { id: companyId }, deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: branches.map(roles => this.toDomain(roles)),
			total,
		};
	}

	async findById(id: number, companyId: number): Promise<Roles | null> {
		const roles = await this.repo.findOne({
			where: {
				id,
				company: { id: companyId },
				deleted: false,
			},
		});

		return roles ? this.toDomain(roles) : null;
	}

	async update(roles: Roles): Promise<Roles> {

		await this.repo.update(
			{
				id: roles.id,
				company: { id: roles.companyId }, // multi-tenant seguro
			},
			{
				code: roles.code,
				description: roles.description,
				enabled: roles.enabled,
			},
		);

		const updated = await this.repo.findOne({
			where: {
				id: roles.id,
				company: { id: roles.companyId },
			},
		});

		return this.toDomain(updated);
	}

	private toDomain(entity: RolesOrmEntity): Roles {
		return new Roles(
			entity.id,
			entity.code,
			entity.description,
			entity.company?.id, // ahora viene de relación
			entity.enabled,
			entity.created_at,
		);
	}
}