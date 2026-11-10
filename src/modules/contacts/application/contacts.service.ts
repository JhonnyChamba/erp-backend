import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactBaseOrmEntity, CustomerOrmEntity, ProviderOrmEntity, SellerOrmEntity } from '../infrastructure/persistence/contacts.orm-entity';
import { CustomerDto, ProviderDto, SellerDto } from './dto/contacts.dto';

export type ContactKind = 'customer' | 'provider' | 'seller';

const LABEL: Record<ContactKind, string> = { customer: 'Cliente', provider: 'Proveedor', seller: 'Vendedor' };

/** Clientes, proveedores y vendedores comparten la misma lógica; cada uno aporta sus campos propios. */
@Injectable()
export class ContactsService {
	constructor(
		@InjectRepository(CustomerOrmEntity) private readonly customerRepo: Repository<CustomerOrmEntity>,
		@InjectRepository(ProviderOrmEntity) private readonly providerRepo: Repository<ProviderOrmEntity>,
		@InjectRepository(SellerOrmEntity) private readonly sellerRepo: Repository<SellerOrmEntity>,
	) {}

	private repo(kind: ContactKind): Repository<any> {
		return kind === 'customer' ? this.customerRepo : kind === 'provider' ? this.providerRepo : this.sellerRepo;
	}

	// ---------- validaciones ----------
	private validateDocument(kind: ContactKind, type: string, number: string) {
		if (type === '07' && kind !== 'customer') throw new BadRequestException('El tipo 07 (Consumidor final) solo aplica a clientes.');
		const value = (number || '').trim();
		const rules: Record<string, [RegExp, string]> = {
			'04': [/^\d{13}$/, 'El RUC debe tener 13 dígitos.'],
			'05': [/^\d{10}$/, 'La cédula debe tener 10 dígitos.'],
			'06': [/^[A-Za-z0-9]{3,20}$/, 'El pasaporte debe ser alfanumérico (3 a 20 caracteres).'],
			'07': [/^9{13}$/, 'El consumidor final debe usar 9999999999999.'],
		};
		const [regex, message] = rules[type];
		if (!regex.test(value)) throw new BadRequestException(message);
		return value;
	}

	private async assertUnique(kind: ContactKind, companyId: number, numDocument: string, exceptId?: number) {
		const existing = await this.repo(kind).findOne({ where: { company_id: companyId, num_document: numDocument, deleted: false } });
		if (existing && existing.id !== exceptId) {
			throw new ConflictException(`Ya existe un ${LABEL[kind].toLowerCase()} con el documento ${numDocument} en esta empresa.`);
		}
	}

	private requireFields(kind: ContactKind, dto: any) {
		const missing: string[] = [];
		if (!dto.tipo_documento) missing.push('tipo_documento');
		if (!dto.num_document?.trim()) missing.push('num_document');
		if (kind === 'seller') {
			if (!dto.nombres?.trim()) missing.push('nombres');
			if (!dto.apellidos?.trim()) missing.push('apellidos');
		} else if (!dto.razon_social?.trim()) {
			missing.push('razon_social');
		}
		if (missing.length) throw new BadRequestException(`Faltan campos obligatorios: ${missing.join(', ')}.`);
	}

	// ---------- mapeo a la forma que usa el frontend ----------
	private base(e: ContactBaseOrmEntity) {
		return {
			id: e.id,
			company_id: e.company_id,
			tipo_documento: e.tipo_documento,
			num_document: e.num_document,
			email: e.email ?? '',
			telefono: e.telefono ?? '',
			direccion: e.direccion ?? '',
			estado: e.estado,
			created_at: new Date(e.created_at).toISOString().slice(0, 10),
		};
	}

	private toItem(kind: ContactKind, e: any) {
		if (kind === 'customer') return { ...this.base(e), razon_social: e.razon_social, nombre_comercial: e.nombre_comercial ?? undefined, ciudad: e.ciudad ?? undefined };
		if (kind === 'provider') return { ...this.base(e), razon_social: e.razon_social, nombre_comercial: e.nombre_comercial ?? undefined, forma_pago: e.forma_pago, banco: e.banco ?? undefined, num_cuenta: e.num_cuenta ?? undefined };
		return { ...this.base(e), nombres: e.nombres, apellidos: e.apellidos, comision_pct: Number(e.comision_pct) };
	}

	private trimStrings(dto: object) {
		const out: any = {};
		for (const [k, v] of Object.entries(dto)) {
			if (v === undefined) continue; // el DTO transformado trae las propiedades no enviadas como undefined: no deben pisar lo guardado
			out[k] = typeof v === 'string' ? v.trim() : v;
		}
		return out;
	}

	// ---------- operaciones ----------
	async list(kind: ContactKind, companyId: number) {
		const rows = await this.repo(kind).find({ where: { company_id: companyId, deleted: false }, order: { id: 'DESC' } });
		return rows.map((r) => this.toItem(kind, r));
	}

	private async findEntity(kind: ContactKind, id: number, companyId: number) {
		const entity = await this.repo(kind).findOne({ where: { id, company_id: companyId, deleted: false } });
		if (!entity) throw new NotFoundException(`${LABEL[kind]} no encontrado.`);
		return entity;
	}

	async get(kind: ContactKind, id: number, companyId: number) {
		return this.toItem(kind, await this.findEntity(kind, id, companyId));
	}

	async create(kind: ContactKind, dto: CustomerDto | ProviderDto | SellerDto, companyId: number, userId?: number) {
		const data = this.trimStrings(dto);
		this.requireFields(kind, data);
		data.num_document = this.validateDocument(kind, data.tipo_documento, data.num_document);
		await this.assertUnique(kind, companyId, data.num_document);

		const repo = this.repo(kind);
		const saved = await repo.save(repo.create({ ...data, company_id: companyId, created_by: userId, estado: data.estado || 'activo', deleted: false }));
		return this.toItem(kind, saved);
	}

	async update(kind: ContactKind, id: number, dto: CustomerDto | ProviderDto | SellerDto, companyId: number) {
		const entity = await this.findEntity(kind, id, companyId);
		const data = this.trimStrings(dto);

		if (data.tipo_documento !== undefined || data.num_document !== undefined) {
			data.num_document = this.validateDocument(kind, data.tipo_documento ?? entity.tipo_documento, data.num_document ?? entity.num_document);
			await this.assertUnique(kind, companyId, data.num_document, entity.id);
		}
		if (kind === 'seller') {
			if (data.nombres === '' || data.apellidos === '') throw new BadRequestException('Nombres y apellidos no pueden quedar vacíos.');
		} else if (data.razon_social === '') {
			throw new BadRequestException('La razón social no puede quedar vacía.');
		}

		// company_id y created_at nunca se modifican desde el cliente (el DTO no los admite)
		Object.assign(entity, data);
		return this.toItem(kind, await this.repo(kind).save(entity));
	}

	async toggleStatus(kind: ContactKind, id: number, companyId: number) {
		const entity = await this.findEntity(kind, id, companyId);
		entity.estado = entity.estado === 'activo' ? 'inactivo' : 'activo';
		return this.toItem(kind, await this.repo(kind).save(entity));
	}

	async remove(kind: ContactKind, id: number, companyId: number) {
		const entity = await this.findEntity(kind, id, companyId);
		entity.deleted = true; // eliminación lógica: se conserva el historial
		await this.repo(kind).save(entity);
		return { success: true };
	}
}
