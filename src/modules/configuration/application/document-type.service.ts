import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentTypeOrmEntity } from '../infrastructure/persistence/document-type.orm-entity';
import { CreateDocumentTypeDto, UpdateDocumentTypeDto } from './dto/document-type.dto';

@Injectable()
export class DocumentTypeService {
	constructor(
		@InjectRepository(DocumentTypeOrmEntity)
		private readonly docTypeRepo: Repository<DocumentTypeOrmEntity>,
	) {}

	/**
	 * Si la empresa no tiene tipos de documentos registrados, sembramos automáticamente los oficiales del SRI
	 */
	private async ensureDefaultDocumentTypes(companyId: number): Promise<void> {
		const count = await this.docTypeRepo.count({
			where: { company_id: companyId, deleted: false },
		});
		if (count > 0) return;

		const defaults = [
			{ name: 'Cédula de Identidad', code: '05', type: 'TODOS' },
			{ name: 'RUC', code: '04', type: 'TODOS' },
			{ name: 'Pasaporte', code: '06', type: 'TODOS' },
			{ name: 'Consumidor Final', code: '07', type: 'CLIENTE' },
			{ name: 'Identificación del Exterior', code: '08', type: 'TODOS' },
		];

		for (const d of defaults) {
			const doc = this.docTypeRepo.create({
				company_id: companyId,
				name: d.name,
				code: d.code,
				type: d.type,
				status: 'ACTIVO',
				deleted: false,
			});
			await this.docTypeRepo.save(doc);
		}
	}

	async list(companyId: number, typeFilter?: string, onlyActive = false): Promise<DocumentTypeOrmEntity[]> {
		await this.ensureDefaultDocumentTypes(companyId);

		const query = this.docTypeRepo
			.createQueryBuilder('dt')
			.where('dt.company_id = :companyId', { companyId })
			.andWhere('dt.deleted = false');

		if (onlyActive) {
			query.andWhere('dt.status = :status', { status: 'ACTIVO' });
		}

		if (typeFilter && typeFilter !== 'TODOS') {
			query.andWhere('(dt.type = :typeFilter OR dt.type = :todos)', {
				typeFilter,
				todos: 'TODOS',
			});
		}

		query.orderBy('dt.code', 'ASC');

		return query.getMany();
	}

	async get(id: number, companyId: number): Promise<DocumentTypeOrmEntity> {
		const doc = await this.docTypeRepo.findOne({
			where: { id, company_id: companyId, deleted: false },
		});
		if (!doc) {
			throw new NotFoundException(`El tipo de documento con ID ${id} no existe en la empresa.`);
		}
		return doc;
	}

	async create(companyId: number, dto: CreateDocumentTypeDto): Promise<DocumentTypeOrmEntity> {
		const existing = await this.docTypeRepo.findOne({
			where: {
				company_id: companyId,
				code: dto.code.trim(),
				type: dto.type.trim().toUpperCase(),
				deleted: false,
			},
		});
		if (existing) {
			throw new ConflictException(
				`Ya existe un tipo de documento con el código "${dto.code}" para el tipo "${dto.type}".`,
			);
		}

		const entity = this.docTypeRepo.create({
			company_id: companyId,
			name: dto.name.trim(),
			code: dto.code.trim(),
			type: dto.type.trim().toUpperCase(),
			status: dto.status || 'ACTIVO',
			deleted: false,
		});

		return this.docTypeRepo.save(entity);
	}

	async update(id: number, companyId: number, dto: UpdateDocumentTypeDto): Promise<DocumentTypeOrmEntity> {
		const doc = await this.get(id, companyId);

		if (dto.name) doc.name = dto.name.trim();
		if (dto.type) doc.type = dto.type.trim().toUpperCase();
		if (dto.code) doc.code = dto.code.trim();
		if (dto.status) doc.status = dto.status;

		return this.docTypeRepo.save(doc);
	}

	async toggleStatus(id: number, companyId: number): Promise<DocumentTypeOrmEntity> {
		const doc = await this.get(id, companyId);
		doc.status = doc.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
		return this.docTypeRepo.save(doc);
	}

	async remove(id: number, companyId: number): Promise<{ success: boolean; message: string }> {
		const doc = await this.get(id, companyId);
		doc.deleted = true;
		await this.docTypeRepo.save(doc);
		return { success: true, message: 'Tipo de documento eliminado correctamente.' };
	}
}
