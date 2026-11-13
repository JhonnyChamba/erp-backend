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
		const nextCode = await this.generateNextCode();

		const entity = this.repo.create({
			code: nextCode,
			desc_icon: modules.desc_icon,
			description: modules.description,
			order_index: (modules as any).order_index ?? (modules as any).orderIndex ?? 0,
			enabled: modules.enabled,
			created_by: modules.createdById,
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	private async generateNextCode(): Promise<string> {
		const all = await this.repo.find({
			select: ['id', 'code'],
			order: { id: 'DESC' },
		});

		if (all.length === 0) {
			return 'MOD-001';
		}

		const last = all[0];
		const match = String(last.code || '').trim().match(/^(.*?)(\d+)$/);

		let prefix = 'MOD-';
		let padLen = 3;
		let nextNum = (last.id || all.length) + 1;

		if (match) {
			prefix = match[1];
			padLen = match[2].length;
			nextNum = parseInt(match[2], 10) + 1;
		}

		const existingCodes = new Set(all.map((m) => String(m.code || '').toUpperCase()));
		let candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		while (existingCodes.has(candidate.toUpperCase())) {
			nextNum++;
			candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		}

		return candidate;
	}

	async findByCompany(page: number, limit: number): Promise<{ data: Module[]; total: number }> {
		const [branches, total] = await this.repo.findAndCount({
			where: { deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { order_index: 'ASC', id: 'ASC' },
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
				order_index: (modules as any).order_index ?? (modules as any).orderIndex ?? 0,
				enabled: modules.enabled
			}
		);

		const updated = await this.repo.findOne({ where: { id: modules.id } });
		return this.toDomain(updated);
	}

	private toDomain(entity: ModuleOrmEntity): Module {
		const m = new Module(
			entity.id,
			entity.code,
			entity.desc_icon,
			entity.description,
			entity.enabled,
			entity.created_at,
		);
		(m as any).order_index = entity.order_index ?? 0;
		return m;
	}
}