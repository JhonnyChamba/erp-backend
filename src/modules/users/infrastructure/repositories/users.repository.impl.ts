import { UsersRepository } from '../../domain/repositories/users.repository';
import { PasswordService } from 'src/common/password/password.service';
import { UsersOrmEntity } from '../persistence/users.orm-entity';
import { Users } from '../../domain/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepositoryImpl implements UsersRepository {

	constructor(
		@InjectRepository(UsersOrmEntity)
		private readonly repo: Repository<UsersOrmEntity>,
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
			multi_company: user.multi_company,
			enabled: user.enabled,
			theme_color: user.theme_color || 'Blue_Theme',

			company: { id: user.companyId },
		});

		const saved = await this.repo.save(entity);
		return this.toDomain(saved);
	}

	async findByCompany(companyId: number, page: number, limit: number): Promise<{ data: Users[]; total: number }> {

		const [branches, total] = await this.repo.findAndCount({
			where: { company: { id: companyId }, deleted: false },
			skip: (page - 1) * limit,
			take: limit,
			order: { created_at: 'DESC' },
		});

		return {
			data: branches.map(user => this.toDomain(user)),
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
			relations: ['company'],
		});

		if (!user && companyId) {
			user = await this.repo.findOne({
				where: { id, deleted: false },
				relations: ['company'],
			});
		}

		return user ? this.toDomain(user) : null;
	}

	async update(user: Users): Promise<Users> {
		await this.repo.update(
			{
				id: user.id,
			},
			{
				num_document: user.num_document,
				name_user: user.name_user,
				last_name_user: user.last_name_user,
				email: user.email,
				password: user.password,
				developer: user.developer,
				multi_company: user.multi_company,
				enabled: user.enabled,
				theme_color: user.theme_color || 'Blue_Theme',
			},
		);

		const updated = await this.repo.findOne({
			where: {
				id: user.id,
			},
			relations: ['company'],
		});

		return this.toDomain(updated!);
	}

	async findByEmail(email: string): Promise<Users | null> {
		const user = await this.repo.findOne({ where: { email } });
		if (!user) return null;

		return this.toDomain(user); // si usas mapper
	}

	private toDomain(entity: UsersOrmEntity): Users {
		return new Users(
			entity.id,
			entity.num_document,
			entity.name_user,
			entity.last_name_user,
			entity.email,
			entity.password,
			entity.company?.id, // ahora viene de relación
			entity.developer,
			entity.multi_company,
			entity.enabled,
			entity.deleted,
			entity.created_at,
			entity.theme_color || 'Blue_Theme',
		);
	}
}