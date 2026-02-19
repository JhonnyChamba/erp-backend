import { ModuleRepository } from '../../domain/repositories/module.repository';
import { ModuleOrmEntity } from '../persistence/module.orm-entity';
import { Module } from '../../domain/entities/module.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class ModuleRepositoryImpl implements ModuleRepository {

	constructor(
		@InjectRepository(ModuleOrmEntity)
		private readonly repo: Repository<ModuleOrmEntity>,
	) { }

	async create(modules: Module): Promise<Module> {
		const entity = this.repo.create({
			code: modules.code,
			desc_icon: modules.desc_icon,
			description: modules.description,
			enabled: modules.enabled,
			
			created_by: modules.createdById
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(page: number, limit: number): Promise<{ data: Module[]; total: number }> {
		const [branches, total] = await this.repo.findAndCount({
			where: { deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: branches.map(modules => this.toDomain(modules)),
			total,
		};
	}

	async findById(id: number): Promise<Module | null> {
		const modules = await this.repo.findOne({ where: { id, deleted: false } });

		return modules ? this.toDomain(modules) : null;
	}

	async update(modules: Module): Promise<Module> {
		await this.repo.update(
			{ id: modules.id },
			{
				code: modules.code,
				desc_icon: modules.desc_icon,
				description: modules.description,
				enabled: modules.enabled
			}
		);

		const updated = await this.repo.findOne({ where: { id: modules.id } });
		return this.toDomain(updated);
	}

	private toDomain(entity: ModuleOrmEntity): Module {
		return new Module(
			entity.id,
			entity.code,
			entity.desc_icon,
			entity.description,
			entity.enabled,
			entity.created_at,
		);
	}
}