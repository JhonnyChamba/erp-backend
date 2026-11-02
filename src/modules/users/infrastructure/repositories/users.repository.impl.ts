import { UsersRepository } from '../../domain/repositories/users.repository';
import { PasswordService } from 'src/common/password/password.service';
import { UsersOrmEntity } from '../persistence/users.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { Users } from '../../domain/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepositoryImpl implements UsersRepository {

	constructor(
		@InjectRepository(UsersOrmEntity)
		private readonly repo: Repository<UsersOrmEntity>,
		@InjectRepository(UserCompanyOrmEntity)
		private readonly userCompanyRepo: Repository<UserCompanyOrmEntity>,
		private readonly passwordService: PasswordService,
	) { }

	async create(user: Users): Promise<Users> {
		const hashedPassword = await this.passwordService.hash(user.password);
		const entity = this.repo.create({
			num_document: user.num_document,
			name_user: user.name_user,
			last_name_user: user.last_name_user,
			email: user.email,
			password: hashedPassword,
			developer: user.developer,
			super_admin: user.super_admin,
			multi_company: user.multi_company,
			enabled: user.enabled,
			theme_color: user.theme_color || 'Blue_Theme',
			company: { id: user.companyId },
		});

		const saved = await this.repo.save(entity);

		if (user.multi_company && user.companyIds && user.companyIds.length > 0) {
			await this.syncUserCompanies(saved.id, user.companyIds);
		}

		const fullUser = await this.findById(saved.id);
		return fullUser!;
	}

	async findByCompany(companyId: number, page: number, limit: number): Promise<{ data: Users[]; total: number }> {
		const [users, total] = await this.repo.findAndCount({
			where: [
				{ company: { id: companyId }, deleted: false },
				{ userCompanies: { company: { id: companyId }, deleted: false, enabled: true } },
			],
			relations: ['company', 'userCompanies', 'userCompanies.company'],
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: users.map(user => this.toDomain(user)),
			total,
		};
	}

	async findById(id: number, companyId?: number): Promise<Users | null> {
		const whereClause: any = { id, deleted: false };
		if (companyId) {
			whereClause.company = { id: companyId };
		}
		let user = await this.repo.findOne({
			where: whereClause,
			relations: ['company', 'userCompanies', 'userCompanies.company'],
		});

		if (!user && companyId) {
			user = await this.repo.findOne({
				where: { id, deleted: false },
				relations: ['company', 'userCompanies', 'userCompanies.company'],
			});
		}

		return user ? this.toDomain(user) : null;
	}

	async update(user: Users): Promise<Users> {
		await this.repo.update(
			{ id: user.id },
			{
				num_document: user.num_document,
				name_user: user.name_user,
				last_name_user: user.last_name_user,
				email: user.email,
				password: user.password,
				developer: user.developer,
				super_admin: user.super_admin,
				multi_company: user.multi_company,
				enabled: user.enabled,
				theme_color: user.theme_color || 'Blue_Theme',
			},
		);

		if (user.companyIds !== undefined) {
			if (user.multi_company) {
				await this.syncUserCompanies(user.id, user.companyIds);
			} else {
				await this.userCompanyRepo
					.createQueryBuilder()
					.update(UserCompanyOrmEntity)
					.set({ deleted: true, enabled: false })
					.where('user_id = :userId', { userId: user.id })
					.execute();
			}
		}

		const updated = await this.findById(user.id);
		return updated!;
	}

	async findByEmail(email: string): Promise<Users | null> {
		const user = await this.repo.findOne({
			where: { email },
			relations: ['company', 'userCompanies', 'userCompanies.company'],
		});
		if (!user) return null;

		return this.toDomain(user);
	}

	private async syncUserCompanies(userId: number, companyIds: number[]): Promise<void> {
		const targetIds = (companyIds || []).map(id => Number(id)).filter(id => !isNaN(id) && id > 0);

		const existing = await this.userCompanyRepo.find({
			where: { user: { id: userId } },
			relations: ['company'],
		});

		const existingMap = new Map<number, UserCompanyOrmEntity>();
		for (const item of existing) {
			const cId = Number(item.company?.id);
			if (cId) {
				existingMap.set(cId, item);
			}
		}

		// Desactivar las que ya no están
		for (const [cId, item] of existingMap.entries()) {
			if (!targetIds.includes(cId)) {
				item.deleted = true;
				item.enabled = false;
				await this.userCompanyRepo.save(item);
			}
		}

		// Activar o crear las seleccionadas
		for (const cId of targetIds) {
			const item = existingMap.get(cId);
			if (item) {
				item.deleted = false;
				item.enabled = true;
				await this.userCompanyRepo.save(item);
			} else {
				const newItem = this.userCompanyRepo.create({
					user: { id: userId } as any,
					company: { id: cId } as any,
					enabled: true,
					deleted: false,
				});
				await this.userCompanyRepo.save(newItem);
			}
		}
	}

	private toDomain(entity: UsersOrmEntity): Users {
		const activeCompanyIds = (entity.userCompanies || [])
			.filter(uc => !uc.deleted && uc.enabled && uc.company?.id)
			.map(uc => uc.company.id);

		return new Users(
			entity.id,
			entity.num_document,
			entity.name_user,
			entity.last_name_user,
			entity.email,
			entity.password,
			entity.company?.id ?? (entity as any).company_id ?? 1,
			entity.developer ?? false,
			entity.multi_company ?? false,
			entity.enabled ?? true,
			entity.deleted ?? false,
			entity.created_at,
			entity.theme_color || 'Blue_Theme',
			entity.super_admin ?? false,
			activeCompanyIds,
		);
	}
}
