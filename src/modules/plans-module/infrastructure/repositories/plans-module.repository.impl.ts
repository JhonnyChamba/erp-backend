import { PlansModulesRepository } from '../../domain/repositories/plans-module.repository';
import { PlansModulesOrmEntity } from '../persistence/plans-module.orm-entity';
import { PlansModules } from '../../domain/entities/plans-module.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PlansModulesRepositoryImpl implements PlansModulesRepository {

	constructor(
		@InjectRepository(PlansModulesOrmEntity)
		private readonly repo: Repository<PlansModulesOrmEntity>,
	) { }

	async create(subModule: PlansModules): Promise<PlansModules> {

		const entity = this.repo.create({
			plans: { id: subModule.planId },
			module: { id: subModule.moduleId },
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(planId: number, page: number, limit: number): Promise<{ data: PlansModules[]; total: number }> {
		const [plansModules, total] = await this.repo.findAndCount({
			where: { plans: { id: planId } },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: plansModules.map(subModule => this.toDomain(subModule)),
			total,
		};
	}

	async findById(id: number, planId: number): Promise<PlansModules | null> {
		const subModule = await this.repo.findOne({ where: { id, plans: { id: planId } } });

		return subModule ? this.toDomain(subModule) : null;
	}

	async update(subModule: PlansModules): Promise<PlansModules> {
		await this.repo.update(
			{ id: subModule.id, plans: { id: subModule.planId } },
			{ module: { id: subModule.moduleId } }
		);

		const updated = await this.repo.findOne({
			where: {
				id: subModule.id,
				plans: { id: subModule.planId },
			},
		});

		return this.toDomain(updated);
	}

	private toDomain(entity: PlansModulesOrmEntity): PlansModules {
		return new PlansModules(
			entity.id,
			entity.plans?.id, // ahora viene de relación
			entity.module?.id, // ahora viene de relación
		);
	}
}