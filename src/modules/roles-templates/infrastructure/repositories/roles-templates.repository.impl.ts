import { RolesTemplatesRepository } from '../../domain/repositories/roles-templates.repository';
import { RolesTemplatesOrmEntity } from '../persistence/roles-templates.orm-entity';
import { RolesTemplates } from '../../domain/entities/roles-templates.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class RolesTemplatesRepositoryImpl implements RolesTemplatesRepository {

	constructor(
		@InjectRepository(RolesTemplatesOrmEntity)
		private readonly repo: Repository<RolesTemplatesOrmEntity>,
	) { }

	async create(rolesTemplates: RolesTemplates): Promise<RolesTemplates> {
		const entity = this.repo.create({
			code: rolesTemplates.code,
			description: rolesTemplates.description,
			enabled: rolesTemplates.enabled,

			created_by: rolesTemplates.createdById
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(page: number, limit: number): Promise<{ data: RolesTemplates[]; total: number }> {

		const [branches, total] = await this.repo.findAndCount({
			where: { deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: branches.map(rolesTemplates => this.toDomain(rolesTemplates)),
			total,
		};
	}

	async findById(id: number): Promise<RolesTemplates | null> {
		const rolesTemplates = await this.repo.findOne({
			where: {
				id,
				deleted: false,
			},
		});

		return rolesTemplates ? this.toDomain(rolesTemplates) : null;
	}

	async update(rolesTemplates: RolesTemplates): Promise<RolesTemplates> {
		await this.repo.update(
			{ id: rolesTemplates.id },
			{
				code: rolesTemplates.code,
				description: rolesTemplates.description,
				enabled: rolesTemplates.enabled,
			},
		);

		const updated = await this.repo.findOne({ where: { id: rolesTemplates.id } });
		return this.toDomain(updated);
	}

	private toDomain(entity: RolesTemplatesOrmEntity): RolesTemplates {
		return new RolesTemplates(
			entity.id,
			entity.code,
			entity.description,
			entity.enabled,
			entity.created_at,
		);
	}
}