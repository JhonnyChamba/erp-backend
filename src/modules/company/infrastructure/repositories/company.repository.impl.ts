import { CompanyRepository } from '../../domain/repositories/company.repository';
import { CompanyOrmEntity } from '../persistence/company.orm-entity';
import { RolesOrmEntity, RoleModuleOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
import { CustomerOrmEntity, SellerOrmEntity } from 'src/modules/contacts/infrastructure/persistence/contacts.orm-entity';
import { InventoryWarehouseOrmEntity } from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
import { BranchCompanyOrmEntity } from 'src/modules/branch-company/infrastructure/persistence/branch-company.orm-entity';
import { EmissionPointOrmEntity, EmissionPointSequenceOrmEntity } from 'src/modules/sales/infrastructure/persistence/emission-point.orm-entity';
import { TaxOrmEntity } from 'src/modules/configuration/infrastructure/persistence/tax.orm-entity';
import { DocumentTypeOrmEntity } from 'src/modules/configuration/infrastructure/persistence/document-type.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
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
		@InjectRepository(CustomerOrmEntity)
		private readonly customerRepo: Repository<CustomerOrmEntity>,
		@InjectRepository(SellerOrmEntity)
		private readonly sellerRepo: Repository<SellerOrmEntity>,
		@InjectRepository(InventoryWarehouseOrmEntity)
		private readonly warehouseRepo: Repository<InventoryWarehouseOrmEntity>,
		@InjectRepository(BranchCompanyOrmEntity)
		private readonly branchRepo: Repository<BranchCompanyOrmEntity>,
		@InjectRepository(EmissionPointOrmEntity)
		private readonly emissionPointRepo: Repository<EmissionPointOrmEntity>,
		@InjectRepository(EmissionPointSequenceOrmEntity)
		private readonly sequenceRepo: Repository<EmissionPointSequenceOrmEntity>,
		@InjectRepository(TaxOrmEntity)
		private readonly taxRepo: Repository<TaxOrmEntity>,
		@InjectRepository(DocumentTypeOrmEntity)
		private readonly docTypeRepo: Repository<DocumentTypeOrmEntity>,
		@InjectRepository(UserCompanyOrmEntity)
		private readonly userCompanyRepo: Repository<UserCompanyOrmEntity>,
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

		// Auto-aprovisionamiento básico: Consumidor Final, Vendedor General, Bodega Matriz, Sucursal 001, Punto 001, Impuestos e Identificaciones
		await this.ensureCompanyDefaults(saved.id, company.createdById, company);

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

	private async ensureCompanyDefaults(companyId: number, createdById?: number, companyData?: Company): Promise<void> {
		try {
			// A. Cliente Consumidor Final SRI (9999999999999)
			const existingCustomer = await this.customerRepo.findOne({
				where: { company_id: companyId, num_document: '9999999999999', deleted: false },
			});
			if (!existingCustomer) {
				await this.customerRepo.save(
					this.customerRepo.create({
						company_id: companyId,
						tipo_documento: '07', // Consumidor Final SRI
						num_document: '9999999999999',
						razon_social: 'CONSUMIDOR FINAL',
						nombre_comercial: 'CONSUMIDOR FINAL',
						direccion: 'S/N',
						email: 'consumidorfinal@deskounta.com',
						telefono: '999999999',
						ciudad: 'Ecuador',
						estado: 'activo',
						deleted: false,
						created_by: createdById,
					}),
				);
			}

			// B. Vendedor General (9999999999)
			const existingSeller = await this.sellerRepo.findOne({
				where: { company_id: companyId, num_document: '9999999999', deleted: false },
			});
			if (!existingSeller) {
				await this.sellerRepo.save(
					this.sellerRepo.create({
						company_id: companyId,
						tipo_documento: '05', // Cédula
						num_document: '9999999999',
						nombres: 'VENDEDOR',
						apellidos: 'GENERAL',
						comision_pct: 0,
						direccion: 'S/N',
						email: '',
						telefono: '',
						estado: 'activo',
						deleted: false,
						created_by: createdById,
					}),
				);
			}

			// C. Bodega Matriz (BOD-001)
			const existingWarehouse = await this.warehouseRepo.findOne({
				where: { company: { id: companyId }, deleted: false },
			});
			if (!existingWarehouse) {
				await this.warehouseRepo.save(
					this.warehouseRepo.create({
						code: 'BOD-001',
						name: 'Bodega Matriz',
						description: 'Bodega principal de almacenamiento y despacho',
						address: (companyData?.fiscal as any)?.address_matriz || companyData?.description || 'Matriz',
						is_default: true,
						company: { id: companyId } as any,
						created_by: createdById,
						enabled: true,
						deleted: false,
					}),
				);
			}

			// D. Sucursal Matriz (001)
			let matrixBranch = await this.branchRepo.findOne({
				where: { company: { id: companyId }, deleted: false, is_matrix: true },
			});
			if (!matrixBranch) {
				matrixBranch = await this.branchRepo.findOne({
					where: { company: { id: companyId }, deleted: false },
				});
			}
			if (!matrixBranch) {
				matrixBranch = await this.branchRepo.save(
					this.branchRepo.create({
						code: '001',
						name: 'MATRIZ',
						address: (companyData?.fiscal as any)?.address_matriz || companyData?.description || 'Matriz',
						emission_point: '001',
						phone: (companyData?.fiscal as any)?.phone || null,
						email: (companyData?.fiscal as any)?.email || null,
						is_matrix: true,
						company: { id: companyId } as any,
						created_by: createdById,
						enabled: true,
						deleted: false,
					}),
				);
			}

			// E. Punto de Emisión (001) y sus Secuenciales SRI
			if (matrixBranch) {
				let ep = await this.emissionPointRepo.findOne({
					where: { company: { id: companyId }, branch: { id: matrixBranch.id }, serie: '001', deleted: false },
				});
				if (!ep) {
					ep = await this.emissionPointRepo.save(
						this.emissionPointRepo.create({
							company: { id: companyId } as any,
							branch: { id: matrixBranch.id } as any,
							description: 'Punto de Emisión 001',
							serie: '001',
							enabled: true,
							deleted: false,
							created_by: createdById,
						}),
					);
				}

				const docTypes = [
					{ type: 'FACTURAS', code: '01' },
					{ type: 'NOTAS_CREDITO', code: '04' },
					{ type: 'RETENCIONES', code: '07' },
					{ type: 'GUIAS_REMISION', code: '06' },
					{ type: 'NOTAS_DEBITO', code: '05' },
					{ type: 'LIQUIDACIONES_COMPRA', code: '03' },
				];
				for (const dt of docTypes) {
					const existingSeq = await this.sequenceRepo.findOne({
						where: { emission_point: { id: ep.id }, document_type: dt.type },
					});
					if (!existingSeq) {
						await this.sequenceRepo.save(
							this.sequenceRepo.create({
								company: { id: companyId } as any,
								emission_point: { id: ep.id } as any,
								document_type: dt.type,
								document_code: dt.code,
								serie: '001',
								correlative: 0,
								enabled: true,
							}),
						);
					}
				}
			}

			// F. Impuestos SRI por Defecto
			const defaultTaxes = [
				{ code: '4', percentage: 15, description: 'IVA 15%', is_default: true },
				{ code: '0', percentage: 0, description: 'IVA 0%', is_default: false },
				{ code: '6', percentage: 0, description: 'No Objeto de Impuesto', is_default: false },
				{ code: '7', percentage: 0, description: 'Exento de IVA', is_default: false },
			];
			for (const tax of defaultTaxes) {
				const existingTax = await this.taxRepo.findOne({
					where: { company_id: companyId, code: tax.code, deleted: false },
				});
				if (!existingTax) {
					await this.taxRepo.save(
						this.taxRepo.create({
							company_id: companyId,
							code: tax.code,
							percentage: tax.percentage,
							description: tax.description,
							is_default: tax.is_default,
							status: 'ACTIVO',
							deleted: false,
						}),
					);
				}
			}

			// G. Tipos de Identificación SRI por Defecto
			const defaultDocTypes = [
				{ code: '05', name: 'Cédula', type: 'TODOS' },
				{ code: '04', name: 'RUC', type: 'TODOS' },
				{ code: '07', name: 'Consumidor Final', type: 'CLIENTE' },
				{ code: '06', name: 'Pasaporte', type: 'TODOS' },
			];
			for (const dt of defaultDocTypes) {
				const existingDt = await this.docTypeRepo.findOne({
					where: { company_id: companyId, code: dt.code, type: dt.type, deleted: false },
				});
				if (!existingDt) {
					await this.docTypeRepo.save(
						this.docTypeRepo.create({
							company_id: companyId,
							code: dt.code,
							name: dt.name,
							type: dt.type,
							status: 'ACTIVO',
							deleted: false,
						}),
					);
				}
			}

			// H. Vínculo Usuario Creador <-> Empresa
			if (createdById) {
				const existingLink = await this.userCompanyRepo.findOne({
					where: { user: { id: createdById }, company: { id: companyId }, deleted: false },
				});
				if (!existingLink) {
					const adminRole = await this.rolesRepo.findOne({
						where: { company: { id: companyId }, deleted: false },
						order: { id: 'ASC' },
					});
					await this.userCompanyRepo.save(
						this.userCompanyRepo.create({
							user: { id: createdById } as any,
							company: { id: companyId } as any,
							role: adminRole ? ({ id: adminRole.id } as any) : null,
							enabled: true,
							deleted: false,
						}),
					);
				}
			}
		} catch (err) {
			console.error(`Error aprovisionando valores por defecto para empresa ${companyId}:`, err);
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
			relations: ['createdBy'],
		});

		if (company) {
			await this.ensureCompanyDefaults(company.id, company.createdBy?.id);
		}

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