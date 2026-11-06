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
		const nextCode = await this.generateNextCode();

		const entity = this.repo.create({
			code: nextCode,
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

	private async generateNextCode(): Promise<string> {
		const all = await this.repo.find({
			select: ['id', 'code'],
			order: { id: 'DESC' },
		});

		if (all.length === 0) {
			return 'SUB-001';
		}

		const last = all[0];
		const match = String(last.code || '').trim().match(/^(.*?)(\d+)$/);

		let prefix = 'SUB-';
		let padLen = 3;
		let nextNum = (last.id || all.length) + 1;

		if (match) {
			prefix = match[1];
			padLen = match[2].length;
			nextNum = parseInt(match[2], 10) + 1;
		}

		const existingCodes = new Set(all.map((sm) => String(sm.code || '').toUpperCase()));
		let candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		while (existingCodes.has(candidate.toUpperCase())) {
			nextNum++;
			candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		}

		return candidate;
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
