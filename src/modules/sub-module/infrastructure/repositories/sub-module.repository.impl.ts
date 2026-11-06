import { subModulesRepository } from '../../domain/repositories/sub-module.repository';
import { subModulesOrmEntity } from '../persistence/sub-module.orm-entity';
import { subModules } from '../../domain/entities/sub-module.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class subModulesRepositoryImpl implements subModulesRepository {

	constructor(
		@InjectRepository(subModulesOrmEntity)
		private readonly repo: Repository<subModulesOrmEntity>,
	) { }

	async create(subModule: subModules): Promise<subModules> {

		const entity = this.repo.create({
			code: subModule.code,
			desc_icon: subModule.desc_icon,
			description: subModule.description,
			url_desc: subModule.url_desc,
			enabled: subModule.enabled,

			module: { id: subModule.moduleId },
			created_by: subModule.createdById,
		});

		const saved = await this.repo.save(entity);
		const reloaded = await this.repo.findOne({
			where: { id: saved.id },
			relations: ['module'],
		});
		return this.toDomain(reloaded || saved);
	}

	async findByCompany(moduleId: number, page: number, limit: number): Promise<{ data: subModules[]; total: number }> {
		const whereClause: any = { deleted: false };
		if (moduleId) {
			whereClause.module = { id: moduleId };
		}

		const [subModulees, total] = await this.repo.findAndCount({
			where: whereClause,
			relations: ['module'],
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: subModulees.map(subModule => this.toDomain(subModule)),
			total,
		};
	}

	async findById(id: number, moduleId: number): Promise<subModules | null> {
		const whereClause: any = { id, deleted: false };
		if (moduleId) {
			whereClause.module = { id: moduleId };
		}

		const subModule = await this.repo.findOne({
			where: whereClause,
			relations: ['module'],
		});

		return subModule ? this.toDomain(subModule) : null;
	}

	async update(subModule: subModules): Promise<subModules> {
		const updatePayload: any = {
			code: subModule.code,
			desc_icon: subModule.desc_icon,
			description: subModule.description,
			url_desc: subModule.url_desc,
			enabled: subModule.enabled,
		};
		if (subModule.moduleId) {
			updatePayload.module = { id: subModule.moduleId };
		}

		await this.repo.update({ id: subModule.id }, updatePayload);

		const updated = await this.repo.findOne({
			where: { id: subModule.id },
			relations: ['module'],
		});

		return this.toDomain(updated);
	}

	private toDomain(entity: subModulesOrmEntity): subModules {
		return new subModules(
			entity.id,
			entity.code,
			entity.desc_icon,
			entity.description,
			entity.url_desc,
			entity.module?.id,
			entity.enabled,
			entity.created_at,
		);
	}
}
