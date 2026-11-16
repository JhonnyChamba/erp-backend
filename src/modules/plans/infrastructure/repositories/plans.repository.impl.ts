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

		if (company.moduleIds && company.moduleIds.length > 0) {
			for (const modId of company.moduleIds) {
				await this.repo.manager.query(
					'INSERT INTO tab_plans_module (plans_id, module_id) VALUES ($1, $2)',
					[saved.id, modId],
				);
			}
		}

		const domain = this.toDomain(saved);
		domain.moduleIds = company.moduleIds || [];
		return domain;
	}

	async findByPlans(page: number, limit: number, search?: string): Promise<{ data: Plans[]; total: number }> {
		const qb = this.repo.createQueryBuilder('p');

		if (search && search.trim()) {
			qb.where('LOWER(p.description) LIKE :search', {
				search: `%${search.trim().toLowerCase()}%`,
			});
		}

		qb.orderBy('p.createdAt', 'DESC')
			.skip((page - 1) * limit)
			.take(limit);

		const [branches, total] = await qb.getManyAndCount();

		const planIds = branches.map((b) => b.id);
		const modMap: Record<number, number[]> = {};
		if (planIds.length > 0) {
			const pms = await this.repo.manager.query(
				'SELECT plans_id, module_id FROM tab_plans_module WHERE plans_id = ANY($1)',
				[planIds],
			);
			for (const row of pms || []) {
				const pId = Number(row.plans_id);
				if (!modMap[pId]) modMap[pId] = [];
				modMap[pId].push(Number(row.module_id));
			}
		}

		return {
			data: branches.map((company) => {
				const d = this.toDomain(company);
				d.moduleIds = modMap[d.id!] || [];
				return d;
			}),
			total,
		};
	}

	async findById(id: number): Promise<Plans | null> {
		const company = await this.repo.findOne({ where: { id } });
		if (!company) return null;
		const domain = this.toDomain(company);
		const pms = await this.repo.manager.query(
			'SELECT module_id FROM tab_plans_module WHERE plans_id = $1',
			[id],
		);
		domain.moduleIds = (pms || []).map((r: any) => Number(r.module_id));
		return domain;
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