import { PermissionsTemplatesRepository } from '../../domain/repositories/permissions-templates.repository';
import { PermissionsTemplatesOrmEntity } from '../persistence/permissions-templates.orm-entity';
import { PermissionsTemplates } from '../../domain/entities/permissions-templates.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsTemplatesRepositoryImpl implements PermissionsTemplatesRepository {

	constructor(
		@InjectRepository(PermissionsTemplatesOrmEntity)
		private readonly repo: Repository<PermissionsTemplatesOrmEntity>,
	) { }

	async create(permissions: PermissionsTemplates): Promise<PermissionsTemplates> {
		const entity = this.repo.create({
			code: permissions.code,
			description: permissions.description,
			enabled: permissions.enabled,
			
			created_by: permissions.createdById
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(page: number, limit: number): Promise<{ data: PermissionsTemplates[]; total: number }> {
		const [branches, total] = await this.repo.findAndCount({
			where: { deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: branches.map(permissions => this.toDomain(permissions)),
			total,
		};
	}

	async findById(id: number): Promise<PermissionsTemplates | null> {
		const permissions = await this.repo.findOne({ where: { id, deleted: false } });

		return permissions ? this.toDomain(permissions) : null;
	}

	async update(permissions: PermissionsTemplates): Promise<PermissionsTemplates> {
		await this.repo.update(
			{ id: permissions.id },
			{
				code: permissions.code,
				description: permissions.description,
				enabled: permissions.enabled
			}
		);

		const updated = await this.repo.findOne({ where: { id: permissions.id } });
		return this.toDomain(updated);
	}

	private toDomain(entity: PermissionsTemplatesOrmEntity): PermissionsTemplates {
		return new PermissionsTemplates(
			entity.id,
			entity.code,
			entity.description,
			entity.enabled,
			entity.created_at,
		);
	}
}