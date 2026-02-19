import { PlansRepository } from '../../domain/repositories/plans.repository';
import { PlansOrmEntity } from '../persistence/plans.orm-entity';
import { Plans } from '../../domain/entities/plans.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PlansRepositoryImpl implements PlansRepository {

	constructor(
		@InjectRepository(PlansOrmEntity)
		private readonly repo: Repository<PlansOrmEntity>,
	) { }

	async create(company: Plans): Promise<Plans> {
		const entity = this.repo.create({
			price: company.price,
			billing_cycle: company.billing_cycle,
			description: company.description,
			max_users: company.max_users,
			max_branches: company.max_branches,
			enabled: company.enabled,
			created_name: company.created_name,
			createdBy: { id: company.createdById }
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByPlans(page: number, limit: number): Promise<{ data: Plans[]; total: number }> {
		const [branches, total] = await this.repo.findAndCount({
			// where: { deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { createdAt: 'DESC' },
		});

		return {
			data: branches.map(company => this.toDomain(company)),
			total,
		};
	}

	async findById(id: number): Promise<Plans | null> {
		const company = await this.repo.findOne({ where: { id } });

		return company ? this.toDomain(company) : null;
	}

	async update(company: Plans): Promise<Plans> {

		await this.repo.update(
			{ id: company.id },
			{
				price: company.price,
				billing_cycle: company.billing_cycle,
				description: company.description,
				max_users: company.max_users,
				max_branches: company.max_branches,
				enabled: company.enabled,
			},
		);

		const updated = await this.repo.findOne({ where: { id: company.id } });

		return this.toDomain(updated);
	}

	private toDomain(entity: PlansOrmEntity): Plans {
		return new Plans(
			entity.id,
			entity.price,
			entity.billing_cycle,
			entity.description,
			entity.max_users,
			entity.max_branches,
			entity.enabled,
			entity.created_name,
			entity.createdAt,
		);
	}
}