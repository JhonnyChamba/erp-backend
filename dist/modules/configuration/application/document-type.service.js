"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentTypeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_type_orm_entity_1 = require("../infrastructure/persistence/document-type.orm-entity");
let DocumentTypeService = class DocumentTypeService {
    docTypeRepo;
    constructor(docTypeRepo) {
        this.docTypeRepo = docTypeRepo;
    }
    async ensureDefaultDocumentTypes(companyId) {
        const count = await this.docTypeRepo.count({
            where: { company_id: companyId, deleted: false },
        });
        if (count > 0)
            return;
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
    async list(companyId, typeFilter, onlyActive = false) {
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
    async get(id, companyId) {
        const doc = await this.docTypeRepo.findOne({
            where: { id, company_id: companyId, deleted: false },
        });
        if (!doc) {
            throw new common_1.NotFoundException(`El tipo de documento con ID ${id} no existe en la empresa.`);
        }
        return doc;
    }
    async create(companyId, dto) {
        const existing = await this.docTypeRepo.findOne({
            where: {
                company_id: companyId,
                code: dto.code.trim(),
                type: dto.type.trim().toUpperCase(),
                deleted: false,
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ya existe un tipo de documento con el código "${dto.code}" para el tipo "${dto.type}".`);
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
    async update(id, companyId, dto) {
        const doc = await this.get(id, companyId);
        if (dto.name)
            doc.name = dto.name.trim();
        if (dto.type)
            doc.type = dto.type.trim().toUpperCase();
        if (dto.code)
            doc.code = dto.code.trim();
        if (dto.status)
            doc.status = dto.status;
        return this.docTypeRepo.save(doc);
    }
    async toggleStatus(id, companyId) {
        const doc = await this.get(id, companyId);
        doc.status = doc.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        return this.docTypeRepo.save(doc);
    }
    async remove(id, companyId) {
        const doc = await this.get(id, companyId);
        doc.deleted = true;
        await this.docTypeRepo.save(doc);
        return { success: true, message: 'Tipo de documento eliminado correctamente.' };
    }
};
exports.DocumentTypeService = DocumentTypeService;
exports.DocumentTypeService = DocumentTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_type_orm_entity_1.DocumentTypeOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DocumentTypeService);
//# sourceMappingURL=document-type.service.js.map