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
	 * Si no existen tipos de documentos registrados a nivel global, sembramos automáticamente los oficiales del SRI
	 */
	private async ensureDefaultDocumentTypes(): Promise<void> {
		const count = await this.docTypeRepo.count({
			where: { deleted: false },
		});
		if (count > 0) return;

		const defaults = [
			{ name: 'RUC', code: '04', type: 'TODOS' },
			{ name: 'Cédula de Identidad', code: '05', type: 'TODOS' },
			{ name: 'Pasaporte', code: '06', type: 'TODOS' },
			{ name: 'Consumidor Final', code: '07', type: 'CLIENTE' },
			{ name: 'Identificación del Exterior', code: '08', type: 'TODOS' },
		];

		for (const d of defaults) {
			const doc = this.docTypeRepo.create({
				name: d.name,
				code: d.code,
				type: d.type,
				status: 'ACTIVO',
				deleted: false,
			});
			await this.docTypeRepo.save(doc);
		}
	}

	async list(typeFilter?: string, onlyActive = false): Promise<DocumentTypeOrmEntity[]> {
		await this.ensureDefaultDocumentTypes();

		const query = this.docTypeRepo
			.createQueryBuilder('dt')
			.where('dt.deleted = false');

		if (onlyActive) {
			query.andWhere('dt.status = :status', { status: 'ACTIVO' });
		}

		if (typeFilter && typeFilter !== 'TODOS') {
			query.andWhere('(dt.type = :typeFilter OR dt.type = :todos)', {
				typeFilter: typeFilter.toUpperCase(),
				todos: 'TODOS',
			});
		}

		query.orderBy('dt.code', 'ASC');

		return query.getMany();
	}

	async get(id: number): Promise<DocumentTypeOrmEntity> {
		const doc = await this.docTypeRepo.findOne({
			where: { id, deleted: false },
		});
		if (!doc) {
			throw new NotFoundException(`El tipo de documento con ID ${id} no existe.`);
		}
		return doc;
	}

	async create(dto: CreateDocumentTypeDto): Promise<DocumentTypeOrmEntity> {
		const existing = await this.docTypeRepo.findOne({
			where: {
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
			name: dto.name.trim(),
			code: dto.code.trim(),
			type: dto.type.trim().toUpperCase(),
			status: dto.status || 'ACTIVO',
			deleted: false,
		});

		return this.docTypeRepo.save(entity);
	}

	async update(id: number, dto: UpdateDocumentTypeDto): Promise<DocumentTypeOrmEntity> {
		const doc = await this.get(id);

		if (dto.name) doc.name = dto.name.trim();
		if (dto.type) doc.type = dto.type.trim().toUpperCase();
		if (dto.code) doc.code = dto.code.trim();
		if (dto.status) doc.status = dto.status;

		return this.docTypeRepo.save(doc);
	}

	async toggleStatus(id: number): Promise<DocumentTypeOrmEntity> {
		const doc = await this.get(id);
		doc.status = doc.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
		return this.docTypeRepo.save(doc);
	}

	async remove(id: number): Promise<{ success: boolean; message: string }> {
		const doc = await this.get(id);
		doc.deleted = true;
		await this.docTypeRepo.save(doc);
		return { success: true, message: 'Tipo de documento eliminado correctamente.' };
	}
}

