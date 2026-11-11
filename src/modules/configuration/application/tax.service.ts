import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxOrmEntity } from '../infrastructure/persistence/tax.orm-entity';
import { CreateTaxDto, UpdateTaxDto } from './dto/tax.dto';

@Injectable()
export class TaxService {
	constructor(
		@InjectRepository(TaxOrmEntity)
		private readonly taxRepo: Repository<TaxOrmEntity>,
	) {}

	/**
	 * Si la empresa no tiene impuestos registrados, sembramos automáticamente las tarifas oficiales del SRI
	 */
	private async ensureDefaultTaxes(companyId: number): Promise<void> {
		const count = await this.taxRepo.count({
			where: { company_id: companyId, deleted: false },
		});
		if (count > 0) return;

		const defaults = [
			{ code: '4', percentage: 15.0, description: 'IVA 15% (Tarifa General)', is_default: true },
			{ code: '0', percentage: 0.0, description: 'IVA 0% (Tarifa Cero)', is_default: false },
			{ code: '6', percentage: 0.0, description: 'No Objeto de Impuesto', is_default: false },
			{ code: '7', percentage: 0.0, description: 'Exento de IVA', is_default: false },
			{ code: '2', percentage: 5.0, description: 'IVA 5% (Materiales Construcción)', is_default: false },
		];

		for (const d of defaults) {
			const tax = this.taxRepo.create({
				company_id: companyId,
				code: d.code,
				percentage: d.percentage,
				description: d.description,
				is_default: d.is_default,
				status: 'ACTIVO',
				deleted: false,
			});
			await this.taxRepo.save(tax);
		}
	}

	async list(companyId: number, onlyActive = false): Promise<TaxOrmEntity[]> {
		await this.ensureDefaultTaxes(companyId);

		const where: any = { company_id: companyId, deleted: false };
		if (onlyActive) {
			where.status = 'ACTIVO';
		}

		return this.taxRepo.find({
			where,
			order: { is_default: 'DESC', percentage: 'DESC', id: 'ASC' },
		});
	}

	async get(id: number, companyId: number): Promise<TaxOrmEntity> {
		const tax = await this.taxRepo.findOne({
			where: { id, company_id: companyId, deleted: false },
		});
		if (!tax) {
			throw new NotFoundException(`El impuesto con ID ${id} no existe en la empresa.`);
		}
		return tax;
	}

	async create(companyId: number, dto: CreateTaxDto): Promise<TaxOrmEntity> {
		const existing = await this.taxRepo.findOne({
			where: { company_id: companyId, code: dto.code.trim(), deleted: false },
		});
		if (existing) {
			throw new ConflictException(`Ya existe un impuesto con el código "${dto.code}" en esta empresa.`);
		}

		if (dto.is_default) {
			// Desmarcar otros default
			await this.taxRepo.update({ company_id: companyId }, { is_default: false });
		}

		const entity = this.taxRepo.create({
			company_id: companyId,
			code: dto.code.trim(),
			percentage: Number(dto.percentage),
			description: dto.description.trim(),
			status: dto.status || 'ACTIVO',
			is_default: Boolean(dto.is_default),
			deleted: false,
		});

		return this.taxRepo.save(entity);
	}

	async update(id: number, companyId: number, dto: UpdateTaxDto): Promise<TaxOrmEntity> {
		const tax = await this.get(id, companyId);

		if (dto.code && dto.code.trim() !== tax.code) {
			const existing = await this.taxRepo.findOne({
				where: { company_id: companyId, code: dto.code.trim(), deleted: false },
			});
			if (existing && existing.id !== id) {
				throw new ConflictException(`Ya existe un impuesto con el código "${dto.code}" en esta empresa.`);
			}
			tax.code = dto.code.trim();
		}

		if (dto.percentage !== undefined) tax.percentage = Number(dto.percentage);
		if (dto.description) tax.description = dto.description.trim();
		if (dto.status) tax.status = dto.status;

		if (dto.is_default !== undefined) {
			if (dto.is_default) {
				await this.taxRepo.update({ company_id: companyId }, { is_default: false });
			}
			tax.is_default = Boolean(dto.is_default);
		}

		return this.taxRepo.save(tax);
	}

	async toggleStatus(id: number, companyId: number): Promise<TaxOrmEntity> {
		const tax = await this.get(id, companyId);
		tax.status = tax.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
		return this.taxRepo.save(tax);
	}

	async remove(id: number, companyId: number): Promise<{ success: boolean; message: string }> {
		const tax = await this.get(id, companyId);
		tax.deleted = true;
		await this.taxRepo.save(tax);
		return { success: true, message: 'Impuesto eliminado correctamente.' };
	}
}

