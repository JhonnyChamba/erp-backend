import { CompanyRepository } from '../../domain/repositories/company.repository';
import { CompanyOrmEntity } from '../persistence/company.orm-entity';
import { RolesOrmEntity, RoleModuleOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
import { Company } from '../../domain/entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyRepositoryImpl implements CompanyRepository {

	constructor(
		@InjectRepository(CompanyOrmEntity)
		private readonly repo: Repository<CompanyOrmEntity>,
		@InjectRepository(RolesOrmEntity)
		private readonly rolesRepo: Repository<RolesOrmEntity>,
		@InjectRepository(RoleModuleOrmEntity)
		private readonly roleModuleRepo: Repository<RoleModuleOrmEntity>,
		@InjectRepository(SubscriptionsOrmEntity)
		private readonly subscriptionsRepo: Repository<SubscriptionsOrmEntity>,
	) { }

	async create(company: Company): Promise<Company> {
		const entity = this.repo.create({
			ruc: company.ruc,
			description: company.description,
			business_name: company.business_name,
			trade_name: company.trade_name,
			enabled: company.enabled,
			created_name: company.created_name,
			createdBy: { id: company.createdById }
		});

		const saved = await this.repo.save(entity);

		// Al crear la empresa, crear automáticamente el rol "Administrador" con acceso a todo lo que tenga su suscripción
		await this.ensureDefaultAdminRole(saved.id, company.createdById);

		return this.toDomain(saved);
	}

	private async ensureDefaultAdminRole(companyId: number, createdById?: number): Promise<void> {
		let adminRole = await this.rolesRepo
			.createQueryBuilder('r')
			.where('r.company_id = :companyId', { companyId })
			.andWhere('r.deleted = false')
			.andWhere('LOWER(r.description) LIKE :desc', { desc: 'administrador%' })
			.getOne();

		if (!adminRole) {
			const existingRoles = await this.rolesRepo.find({
				where: { company: { id: companyId } },
				select: ['id', 'code'],
				order: { id: 'DESC' },
			});
			const nextCode = existingRoles.length === 0 ? 'ROL-001' : `ROL-${String(existingRoles.length + 1).padStart(3, '0')}`;
			adminRole = await this.rolesRepo.save(
				this.rolesRepo.create({
					code: nextCode,
					description: 'Administrador',
					enabled: true,
					deleted: false,
					company: { id: companyId } as any,
					created_by: createdById,
				}),
			);
		}

		// Si la empresa ya tiene suscripción activa, asignar todos sus módulos y submódulos en true al rol Administrador
		const activeSubs = await this.subscriptionsRepo.find({
			where: { company: { id: companyId }, deleted: false, enabled: true },
			relations: ['subscriptionModules', 'subscriptionModules.module', 'subscriptionModules.subModule'],
		});

		const modIds = new Set<number>();
		const subModIds = new Set<number>();
		for (const sub of activeSubs) {
			for (const sm of sub.subscriptionModules || []) {
				if (!sm.deleted && sm.enabled !== false) {
					if (sm.module?.id) modIds.add(Number(sm.module.id));
					if (sm.subModule?.id) subModIds.add(Number(sm.subModule.id));
				}
			}
		}

		if (modIds.size > 0 || subModIds.size > 0) {
			await this.roleModuleRepo
				.createQueryBuilder()
				.update(RoleModuleOrmEntity)
				.set({ deleted: true, enabled: false })
				.where('role_id = :roleId', { roleId: adminRole.id })
				.execute();

			for (const modId of modIds) {
				await this.roleModuleRepo.save(
					this.roleModuleRepo.create({
						role: { id: adminRole.id } as any,
						module: { id: modId } as any,
						subModule: null as any,
						has_access: true,
						enabled: true,
						deleted: false,
					}),
				);
			}
			for (const subModId of subModIds) {
				await this.roleModuleRepo.save(
					this.roleModuleRepo.create({
						role: { id: adminRole.id } as any,
						module: null as any,
						subModule: { id: subModId } as any,
						has_access: true,
						enabled: true,
						deleted: false,
					}),
				);
			}
		}
	}

	async findByCompany(page: number, limit: number): Promise<{ data: Company[]; total: number }> {

		const [branches, total] = await this.repo.findAndCount({
			where: { deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { createdAt: 'DESC' },
		});

		return {
			data: branches.map(company => this.toDomain(company)),
			total,
		};
	}

	async findById(id: number): Promise<Company | null> {

		const company = await this.repo.findOne({
			where: {
				id,
				deleted: false,
			},
		});

		return company ? this.toDomain(company) : null;
	}

	async update(company: Company): Promise<Company> {

		await this.repo.update(
			{ id: company.id },
			{
				ruc: company.ruc,
				description: company.description,
				business_name: company.business_name,
				trade_name: company.trade_name,
				enabled: company.enabled,
			},
		);

		const updated = await this.repo.findOne({ where: { id: company.id } });

		return this.toDomain(updated);
	}

	private toDomain(entity: CompanyOrmEntity): Company {
		return new Company(
			entity.id,
			entity.ruc,
			entity.description,
			entity.business_name,
			entity.trade_name,
			entity.enabled,
			entity.deleted,
			entity.created_name,
			entity.createdAt,
		);
	}
}