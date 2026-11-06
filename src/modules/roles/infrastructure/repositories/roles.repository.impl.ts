import { RolesRepository } from '../../domain/repositories/roles.repository';
import { RolesOrmEntity, RoleModuleOrmEntity } from '../persistence/roles.orm-entity';
import { Roles, RoleAccessDetail } from '../../domain/entities/roles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class RolesRepositoryImpl implements RolesRepository {

	constructor(
		@InjectRepository(RolesOrmEntity)
		private readonly repo: Repository<RolesOrmEntity>,
		@InjectRepository(RoleModuleOrmEntity)
		private readonly roleModuleRepo: Repository<RoleModuleOrmEntity>,
	) { }

	async create(roles: Roles): Promise<Roles> {
		const finalCode = roles.code?.trim()
			? roles.code.trim()
			: await this.generateNextCode(roles.companyId);

		const entity = this.repo.create({
			code: finalCode,
			description: roles.description,
			enabled: roles.enabled,
			company: { id: roles.companyId },
			created_by: roles.createdById,
		});

		const saved = await this.repo.save(entity);

		await this.syncRoleAccess(
			saved.id,
			roles.moduleIds || [],
			roles.subModuleIds || [],
			roles.details,
		);

		const full = await this.findById(saved.id, roles.companyId);
		return full || this.toDomain(saved);
	}

	private async generateNextCode(companyId: number): Promise<string> {
		const all = await this.repo.find({
			where: { company: { id: companyId } },
			select: ['id', 'code'],
			order: { id: 'DESC' },
		});

		if (all.length === 0) {
			return 'ROL-001';
		}

		const last = all[0];
		const match = String(last.code || '').trim().match(/^(.*?)(\d+)$/);

		let prefix = 'ROL-';
		let padLen = 3;
		let nextNum = all.length + 1;

		if (match) {
			prefix = match[1];
			padLen = match[2].length;
			nextNum = parseInt(match[2], 10) + 1;
		}

		const existingCodes = new Set(all.map((r) => String(r.code || '').toUpperCase()));
		let candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		while (existingCodes.has(candidate.toUpperCase())) {
			nextNum++;
			candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		}

		return candidate;
	}

	async findByCompany(companyId: number, page: number, limit: number): Promise<{ data: Roles[]; total: number }> {
		const [branches, total] = await this.repo.findAndCount({
			where: { company: { id: companyId }, deleted: false },
			relations: ['company', 'roleModules', 'roleModules.module', 'roleModules.subModule'],
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: branches.map(roles => this.toDomain(roles)),
			total,
		};
	}

	async findById(id: number, companyId?: number): Promise<Roles | null> {
		const whereClause: any = { id, deleted: false };
		if (companyId) {
			whereClause.company = { id: companyId };
		}

		const roles = await this.repo.findOne({
			where: whereClause,
			relations: ['company', 'roleModules', 'roleModules.module', 'roleModules.subModule'],
		});

		return roles ? this.toDomain(roles) : null;
	}

	async update(roles: Roles): Promise<Roles> {
		const whereClause: any = { id: roles.id };
		if (roles.companyId) {
			whereClause.company = { id: roles.companyId };
		}

		await this.repo.update(
			whereClause,
			{
				code: roles.code,
				description: roles.description,
				enabled: roles.enabled,
			},
		);

		if (
			roles.moduleIds !== undefined ||
			roles.subModuleIds !== undefined ||
			roles.details !== undefined
		) {
			await this.syncRoleAccess(
				roles.id!,
				roles.moduleIds || [],
				roles.subModuleIds || [],
				roles.details,
			);
		}

		const updated = await this.findById(roles.id!, roles.companyId);
		return updated!;
	}

	private async syncRoleAccess(
		roleId: number,
		moduleIds: number[],
		subModuleIds: number[],
		details?: RoleAccessDetail[],
	): Promise<void> {
		await this.roleModuleRepo
			.createQueryBuilder()
			.update(RoleModuleOrmEntity)
			.set({ deleted: true, enabled: false })
			.where('role_id = :roleId', { roleId })
			.execute();

		if (Array.isArray(details) && details.length > 0) {
			for (const item of details) {
				const entity = this.roleModuleRepo.create({
					role: { id: roleId } as any,
					module: item.moduleId ? ({ id: Number(item.moduleId) } as any) : null,
					subModule: item.subModuleId ? ({ id: Number(item.subModuleId) } as any) : null,
					has_access: Boolean(item.hasAccess),
					enabled: true,
					deleted: false,
				});
				await this.roleModuleRepo.save(entity);
			}
			return;
		}

		const targetModIds = Array.from(
			new Set((moduleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)),
		);
		const targetSubModIds = Array.from(
			new Set((subModuleIds || []).map(Number).filter((id) => !isNaN(id) && id > 0)),
		);

		for (const modId of targetModIds) {
			const entity = this.roleModuleRepo.create({
				role: { id: roleId } as any,
				module: { id: modId } as any,
				subModule: null as any,
				has_access: true,
				enabled: true,
				deleted: false,
			});
			await this.roleModuleRepo.save(entity);
		}

		for (const subModId of targetSubModIds) {
			const entity = this.roleModuleRepo.create({
				role: { id: roleId } as any,
				module: null as any,
				subModule: { id: subModId } as any,
				has_access: true,
				enabled: true,
				deleted: false,
			});
			await this.roleModuleRepo.save(entity);
		}
	}

	private toDomain(entity: RolesOrmEntity): Roles {
		const activeItems = (entity.roleModules || []).filter(
			(rm) => !rm.deleted && rm.enabled !== false,
		);

		const moduleIds = Array.from(
			new Set(
				activeItems
					.filter((rm) => rm.module?.id && rm.has_access !== false)
					.map((rm) => Number(rm.module.id)),
			),
		);

		const subModuleIds = Array.from(
			new Set(
				activeItems
					.filter((rm) => rm.subModule?.id && rm.has_access !== false)
					.map((rm) => Number(rm.subModule.id)),
			),
		);

		const details: RoleAccessDetail[] = activeItems.map((rm) => ({
			moduleId: rm.module?.id ? Number(rm.module.id) : null,
			subModuleId: rm.subModule?.id ? Number(rm.subModule.id) : null,
			hasAccess: rm.has_access !== false,
		}));

		return new Roles(
			entity.id,
			entity.code,
			entity.description,
			entity.company?.id,
			entity.enabled,
			entity.created_at,
			entity.created_by,
			moduleIds,
			subModuleIds,
			details,
		);
	}
}