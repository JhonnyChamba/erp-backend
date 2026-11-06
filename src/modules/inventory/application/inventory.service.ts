import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
	InventoryItemOrmEntity,
	InventoryServiceOrmEntity,
	InventorySubcontractOrmEntity,
} from '../infrastructure/persistence/inventory.orm-entity';
import {
	CreateInventoryItemDto,
	UpdateInventoryItemDto,
	CreateInventoryServiceDto,
	UpdateInventoryServiceDto,
	CreateInventorySubcontractDto,
	UpdateInventorySubcontractDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
	constructor(
		@InjectRepository(InventoryItemOrmEntity)
		private readonly itemRepo: Repository<InventoryItemOrmEntity>,
		@InjectRepository(InventoryServiceOrmEntity)
		private readonly serviceRepo: Repository<InventoryServiceOrmEntity>,
		@InjectRepository(InventorySubcontractOrmEntity)
		private readonly subcontractRepo: Repository<InventorySubcontractOrmEntity>,
	) {}

	private async generateNextCode(
		repo: Repository<any>,
		companyId: number,
		defaultPrefix: string,
	): Promise<string> {
		const all = await repo.find({
			where: { company: { id: companyId } },
			select: ['id', 'code'],
			order: { id: 'DESC' },
		});

		if (all.length === 0) {
			return `${defaultPrefix}001`;
		}

		const last = all[0];
		const match = String(last.code || '').trim().match(/^(.*?)(\d+)$/);

		let prefix = defaultPrefix;
		let padLen = 3;
		let nextNum = all.length + 1;

		if (match) {
			prefix = match[1];
			padLen = match[2].length;
			nextNum = parseInt(match[2], 10) + 1;
		}

		const existingCodes = new Set(all.map((r: any) => String(r.code || '').toUpperCase()));
		let candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		while (existingCodes.has(candidate.toUpperCase())) {
			nextNum++;
			candidate = `${prefix}${String(nextNum).padStart(padLen, '0')}`;
		}

		return candidate;
	}

	// =========================================================================
	// 1. CRUD DE ÍTEMS / ARTÍCULOS FÍSICOS (tab_inventory_item)
	// =========================================================================
	async listItems(companyId: number) {
		const rows = await this.itemRepo.find({
			where: { company: { id: companyId }, deleted: false },
			relations: ['company'],
			order: { id: 'DESC' },
		});
		return rows.map((r) => this.mapItem(r));
	}

	async createItem(dto: CreateInventoryItemDto, companyId: number, userId?: number) {
		const nextCode = dto.code?.trim() || (await this.generateNextCode(this.itemRepo, companyId, 'ART-'));
		const entity = this.itemRepo.create({
			code: nextCode,
			sku: dto.sku || '',
			name: dto.name,
			category: dto.category || 'General',
			unit_measure: dto.unit_measure || dto.unit || 'UND',
			cost_price: Number(dto.cost_price ?? dto.costPrice ?? 0),
			sale_price: Number(dto.sale_price ?? dto.salePrice ?? 0),
			tax_rate: Number(dto.tax_rate ?? dto.taxRate ?? 15),
			stock_current: Number(dto.stock_current ?? dto.stockCurrent ?? 0),
			stock_min: Number(dto.stock_min ?? dto.stockMin ?? 0),
			warehouse_location: dto.warehouse_location || dto.location || 'Bodega Principal',
			description: dto.description || '',
			enabled: dto.enabled ?? dto.status ?? true,
			deleted: false,
			company: { id: companyId } as any,
			created_by: userId,
		});
		const saved = await this.itemRepo.save(entity);
		return this.mapItem(saved, companyId);
	}

	async updateItem(id: number, companyId: number, dto: UpdateInventoryItemDto) {
		const existing = await this.itemRepo.findOne({
			where: { id, company: { id: companyId }, deleted: false },
			relations: ['company'],
		});
		if (!existing) throw new NotFoundException('Artículo no encontrado');

		existing.sku = dto.sku ?? existing.sku;
		existing.name = dto.name ?? existing.name;
		existing.category = dto.category ?? existing.category;
		existing.unit_measure = dto.unit_measure ?? dto.unit ?? existing.unit_measure;
		const costPrice = dto.cost_price ?? dto.costPrice;
		if (costPrice !== undefined) existing.cost_price = Number(costPrice);
		const salePrice = dto.sale_price ?? dto.salePrice;
		if (salePrice !== undefined) existing.sale_price = Number(salePrice);
		const taxRate = dto.tax_rate ?? dto.taxRate;
		if (taxRate !== undefined) existing.tax_rate = Number(taxRate);
		const stockCurrent = dto.stock_current ?? dto.stockCurrent;
		if (stockCurrent !== undefined) existing.stock_current = Number(stockCurrent);
		const stockMin = dto.stock_min ?? dto.stockMin;
		if (stockMin !== undefined) existing.stock_min = Number(stockMin);
		existing.warehouse_location = dto.warehouse_location ?? dto.location ?? existing.warehouse_location;
		existing.description = dto.description ?? existing.description;
		const statusVal = dto.enabled ?? dto.status;
		if (statusVal !== undefined) existing.enabled = statusVal;

		const saved = await this.itemRepo.save(existing);
		return this.mapItem(saved, companyId);
	}

	async deleteItem(id: number, companyId: number) {
		await this.itemRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
		return { deleted: true, id };
	}

	private mapItem(r: InventoryItemOrmEntity, fallbackCompanyId?: number) {
		const status = r.enabled !== false;
		return {
			id: r.id,
			companyId: r.company?.id || fallbackCompanyId || 1,
			code: r.code,
			sku: r.sku || '',
			name: r.name,
			category: r.category || 'General',
			unit: r.unit_measure || 'UND',
			unit_measure: r.unit_measure || 'UND',
			costPrice: Number(r.cost_price || 0),
			cost_price: Number(r.cost_price || 0),
			salePrice: Number(r.sale_price || 0),
			sale_price: Number(r.sale_price || 0),
			taxRate: Number(r.tax_rate ?? 15),
			tax_rate: Number(r.tax_rate ?? 15),
			stockCurrent: Number(r.stock_current || 0),
			stock_current: Number(r.stock_current || 0),
			stockMin: Number(r.stock_min || 0),
			stock_min: Number(r.stock_min || 0),
			location: r.warehouse_location || 'Bodega Principal',
			warehouse_location: r.warehouse_location || 'Bodega Principal',
			description: r.description || '',
			status,
			enabled: status,
			created_at: r.created_at,
		};
	}

	// =========================================================================
	// 2. CRUD DE SERVICIOS PROPIOS (tab_inventory_service)
	// =========================================================================
	async listServices(companyId: number) {
		const rows = await this.serviceRepo.find({
			where: { company: { id: companyId }, deleted: false },
			relations: ['company'],
			order: { id: 'DESC' },
		});
		return rows.map((r) => this.mapService(r));
	}

	async createService(dto: CreateInventoryServiceDto, companyId: number, userId?: number) {
		const nextCode = dto.code?.trim() || (await this.generateNextCode(this.serviceRepo, companyId, 'SRV-'));
		const entity = this.serviceRepo.create({
			code: nextCode,
			name: dto.name,
			category: dto.category || 'Servicios Profesionales',
			billing_unit: dto.billing_unit || dto.unit || 'SERV',
			base_cost: Number(dto.base_cost ?? dto.costPrice ?? 0),
			sale_price: Number(dto.sale_price ?? dto.salePrice ?? 0),
			tax_rate: Number(dto.tax_rate ?? dto.taxRate ?? 15),
			estimated_duration: dto.estimated_duration || dto.estimatedDuration || 'Según alcance',
			description: dto.description || '',
			enabled: dto.enabled ?? dto.status ?? true,
			deleted: false,
			company: { id: companyId } as any,
			created_by: userId,
		});
		const saved = await this.serviceRepo.save(entity);
		return this.mapService(saved, companyId);
	}

	async updateService(id: number, companyId: number, dto: UpdateInventoryServiceDto) {
		const existing = await this.serviceRepo.findOne({
			where: { id, company: { id: companyId }, deleted: false },
			relations: ['company'],
		});
		if (!existing) throw new NotFoundException('Servicio no encontrado');

		existing.name = dto.name ?? existing.name;
		existing.category = dto.category ?? existing.category;
		existing.billing_unit = dto.billing_unit ?? dto.unit ?? existing.billing_unit;
		const baseCost = dto.base_cost ?? dto.costPrice;
		if (baseCost !== undefined) existing.base_cost = Number(baseCost);
		const salePrice = dto.sale_price ?? dto.salePrice;
		if (salePrice !== undefined) existing.sale_price = Number(salePrice);
		const taxRate = dto.tax_rate ?? dto.taxRate;
		if (taxRate !== undefined) existing.tax_rate = Number(taxRate);
		existing.estimated_duration = dto.estimated_duration ?? dto.estimatedDuration ?? existing.estimated_duration;
		existing.description = dto.description ?? existing.description;
		const statusVal = dto.enabled ?? dto.status;
		if (statusVal !== undefined) existing.enabled = statusVal;

		const saved = await this.serviceRepo.save(existing);
		return this.mapService(saved, companyId);
	}

	async deleteService(id: number, companyId: number) {
		await this.serviceRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
		return { deleted: true, id };
	}

	private mapService(r: InventoryServiceOrmEntity, fallbackCompanyId?: number) {
		const status = r.enabled !== false;
		return {
			id: r.id,
			companyId: r.company?.id || fallbackCompanyId || 1,
			code: r.code,
			name: r.name,
			category: r.category || 'Servicios Generales',
			unit: r.billing_unit || 'SERV',
			billing_unit: r.billing_unit || 'SERV',
			costPrice: Number(r.base_cost || 0),
			base_cost: Number(r.base_cost || 0),
			salePrice: Number(r.sale_price || 0),
			sale_price: Number(r.sale_price || 0),
			taxRate: Number(r.tax_rate ?? 15),
			tax_rate: Number(r.tax_rate ?? 15),
			estimatedDuration: r.estimated_duration || '',
			estimated_duration: r.estimated_duration || '',
			description: r.description || '',
			status,
			enabled: status,
			created_at: r.created_at,
		};
	}

	// =========================================================================
	// 3. CRUD DE SUBCONTRATACIÓN / MANO DE OBRA (tab_inventory_subcontract)
	// =========================================================================
	async listSubcontracts(companyId: number) {
		const rows = await this.subcontractRepo.find({
			where: { company: { id: companyId }, deleted: false },
			relations: ['company'],
			order: { id: 'DESC' },
		});
		return rows.map((r) => this.mapSubcontract(r));
	}

	async createSubcontract(dto: CreateInventorySubcontractDto, companyId: number, userId?: number) {
		const nextCode = dto.code?.trim() || (await this.generateNextCode(this.subcontractRepo, companyId, 'MO-'));
		const entity = this.subcontractRepo.create({
			code: nextCode,
			name: dto.name,
			specialty_area: dto.specialty_area || dto.specialty || 'Mano de Obra',
			contractor_name: dto.contractor_name || dto.contractorName || '',
			contractor_ruc: dto.contractor_ruc || dto.contractorTaxId || '',
			unit_measure: dto.unit_measure || dto.unit || 'HORA_HOMBRE',
			unit_cost: Number(dto.unit_cost ?? dto.unitCost ?? 0),
			suggested_price: Number(dto.suggested_price ?? dto.suggestedPrice ?? 0),
			tax_rate: Number(dto.tax_rate ?? dto.taxRate ?? 15),
			includes_materials: Boolean(dto.includes_materials ?? dto.includesMaterials),
			description: dto.description || '',
			enabled: dto.enabled ?? dto.status ?? true,
			deleted: false,
			company: { id: companyId } as any,
			created_by: userId,
		});
		const saved = await this.subcontractRepo.save(entity);
		return this.mapSubcontract(saved, companyId);
	}

	async updateSubcontract(id: number, companyId: number, dto: UpdateInventorySubcontractDto) {
		const existing = await this.subcontractRepo.findOne({
			where: { id, company: { id: companyId }, deleted: false },
			relations: ['company'],
		});
		if (!existing) throw new NotFoundException('Registro de subcontratación / mano de obra no encontrado');

		existing.name = dto.name ?? existing.name;
		existing.specialty_area = dto.specialty_area ?? dto.specialty ?? existing.specialty_area;
		existing.contractor_name = dto.contractor_name ?? dto.contractorName ?? existing.contractor_name;
		existing.contractor_ruc = dto.contractor_ruc ?? dto.contractorTaxId ?? existing.contractor_ruc;
		existing.unit_measure = dto.unit_measure ?? dto.unit ?? existing.unit_measure;
		const unitCost = dto.unit_cost ?? dto.unitCost;
		if (unitCost !== undefined) existing.unit_cost = Number(unitCost);
		const suggestedPrice = dto.suggested_price ?? dto.suggestedPrice;
		if (suggestedPrice !== undefined) existing.suggested_price = Number(suggestedPrice);
		const taxRate = dto.tax_rate ?? dto.taxRate;
		if (taxRate !== undefined) existing.tax_rate = Number(taxRate);
		const incMat = dto.includes_materials ?? dto.includesMaterials;
		if (incMat !== undefined) existing.includes_materials = Boolean(incMat);
		existing.description = dto.description ?? existing.description;
		const statusVal = dto.enabled ?? dto.status;
		if (statusVal !== undefined) existing.enabled = statusVal;

		const saved = await this.subcontractRepo.save(existing);
		return this.mapSubcontract(saved, companyId);
	}

	async deleteSubcontract(id: number, companyId: number) {
		await this.subcontractRepo.update({ id, company: { id: companyId } }, { deleted: true, enabled: false });
		return { deleted: true, id };
	}

	private mapSubcontract(r: InventorySubcontractOrmEntity, fallbackCompanyId?: number) {
		const status = r.enabled !== false;
		return {
			id: r.id,
			companyId: r.company?.id || fallbackCompanyId || 1,
			code: r.code,
			name: r.name,
			specialty: r.specialty_area || 'Mano de Obra',
			specialty_area: r.specialty_area || 'Mano de Obra',
			contractorName: r.contractor_name || '',
			contractor_name: r.contractor_name || '',
			contractorTaxId: r.contractor_ruc || '',
			contractor_ruc: r.contractor_ruc || '',
			unit: r.unit_measure || 'HORA_HOMBRE',
			unit_measure: r.unit_measure || 'HORA_HOMBRE',
			unitCost: Number(r.unit_cost || 0),
			unit_cost: Number(r.unit_cost || 0),
			suggestedPrice: Number(r.suggested_price || 0),
			suggested_price: Number(r.suggested_price || 0),
			taxRate: Number(r.tax_rate ?? 15),
			tax_rate: Number(r.tax_rate ?? 15),
			includesMaterials: Boolean(r.includes_materials),
			includes_materials: Boolean(r.includes_materials),
			description: r.description || '',
			status,
			enabled: status,
			created_at: r.created_at,
		};
	}
}
