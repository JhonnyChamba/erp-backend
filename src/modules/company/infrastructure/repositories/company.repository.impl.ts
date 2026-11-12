import { CompanyRepository } from '../../domain/repositories/company.repository';
import { CompanyOrmEntity } from '../persistence/company.orm-entity';
import { RolesOrmEntity, RoleModuleOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
import { Company } from '../../domain/entities/company.entity';
import { encryptSecret } from 'src/common/crypto/secret-crypto';
import { inspectP12 } from '../../application/cert-inspector.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

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

	private buildExtraColumns(company: Company): Record<string, any> {
		const f: any = company.fiscal || {};
		const s = company.secrets || {};
		const cols: Record<string, any> = {};
		for (const k of [
			'address_matriz', 'phone', 'email', 'obligated_accounting', 'special_taxpayer', 'tax_regime',
			'sri_environment', 'auto_send_sri', 'default_establishment', 'default_emission_point', 'cert_file_name',
			'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_from_name', 'smtp_from_email',
		]) {
			if (f[k] !== undefined) cols[k] = f[k] === '' ? null : f[k];
		}
		if (f.cert_expires_at !== undefined) cols.cert_expires_at = f.cert_expires_at || null;

		if (s.remove_certificate) {
			cols.cert_p12_base64 = null;
			cols.cert_password_enc = null;
			cols.cert_file_name = null;
			cols.cert_expires_at = null;
		}
		if (s.cert_p12_base64) cols.cert_p12_base64 = s.cert_p12_base64;
		if (s.cert_password) cols.cert_password_enc = encryptSecret(s.cert_password);
		if (s.cert_p12_base64 && s.cert_password) {
			try {
				const certInfo = inspectP12(s.cert_p12_base64, s.cert_password);
				if (certInfo.expires_at) {
					cols.cert_expires_at = certInfo.expires_at;
				}
			} catch (certErr) {
				console.warn('No se pudo auto-extraer fecha de caducidad del .p12:', certErr);
			}
		}
		if (s.smtp_password) {
			cols.smtp_password_enc = encryptSecret(s.smtp_password);
			cols.smtp_has_password = true;
		}
		return cols;
	}

	async create(company: Company): Promise<Company> {
		const entity = this.repo.create({
			ruc: company.ruc,
			description: company.description,
			business_name: company.business_name,
			trade_name: company.trade_name,
			enabled: company.enabled,
			created_name: company.created_name,
			createdBy: { id: company.createdById },
			...this.buildExtraColumns(company),
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

	async findByCompany(page: number, limit: number, companyIds?: number[] | null): Promise<{ data: Company[]; total: number }> {

		const [branches, total] = await this.repo.findAndCount({
			// companyIds: null/undefined = sin restricción (super admin); lista = solo esas empresas
			where: companyIds ? { deleted: false, id: In(companyIds) } : { deleted: false },
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
				...this.buildExtraColumns(company),
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
			undefined,
			{
				address_matriz: entity.address_matriz ?? '',
				phone: entity.phone ?? '',
				email: entity.email ?? '',
				obligated_accounting: entity.obligated_accounting ?? false,
				special_taxpayer: entity.special_taxpayer ?? '',
				tax_regime: entity.tax_regime ?? 'GENERAL',
				sri_environment: entity.sri_environment ?? '1',
				auto_send_sri: Boolean(entity.auto_send_sri),
				default_establishment: entity.default_establishment ?? '001',
				default_emission_point: entity.default_emission_point ?? '001',
				cert_file_name: entity.cert_file_name ?? '',
				cert_expires_at: entity.cert_expires_at ?? '',
				has_certificate: Boolean(entity.cert_file_name),
				smtp_host: entity.smtp_host ?? '',
				smtp_port: entity.smtp_port ?? 587,
				smtp_secure: entity.smtp_secure ?? true,
				smtp_user: entity.smtp_user ?? '',
				has_smtp_password: Boolean(entity.smtp_has_password),
				smtp_from_name: entity.smtp_from_name ?? '',
				smtp_from_email: entity.smtp_from_email ?? '',
			},
		);
	}
}