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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contacts_orm_entity_1 = require("../infrastructure/persistence/contacts.orm-entity");
const LABEL = { customer: 'Cliente', provider: 'Proveedor', seller: 'Vendedor' };
let ContactsService = class ContactsService {
    customerRepo;
    providerRepo;
    sellerRepo;
    constructor(customerRepo, providerRepo, sellerRepo) {
        this.customerRepo = customerRepo;
        this.providerRepo = providerRepo;
        this.sellerRepo = sellerRepo;
    }
    repo(kind) {
        return kind === 'customer' ? this.customerRepo : kind === 'provider' ? this.providerRepo : this.sellerRepo;
    }
    validateDocument(kind, type, number) {
        if (type === '07' && kind !== 'customer')
            throw new common_1.BadRequestException('El tipo 07 (Consumidor final) solo aplica a clientes.');
        const value = (number || '').trim();
        const rules = {
            '04': [/^\d{13}$/, 'El RUC debe tener 13 dígitos.'],
            '05': [/^\d{10}$/, 'La cédula debe tener 10 dígitos.'],
            '06': [/^[A-Za-z0-9]{3,20}$/, 'El pasaporte debe ser alfanumérico (3 a 20 caracteres).'],
            '07': [/^9{13}$/, 'El consumidor final debe usar 9999999999999.'],
        };
        const [regex, message] = rules[type];
        if (!regex.test(value))
            throw new common_1.BadRequestException(message);
        return value;
    }
    async assertUnique(kind, companyId, numDocument, exceptId) {
        const existing = await this.repo(kind).findOne({ where: { company_id: companyId, num_document: numDocument, deleted: false } });
        if (existing && existing.id !== exceptId) {
            throw new common_1.ConflictException(`Ya existe un ${LABEL[kind].toLowerCase()} con el documento ${numDocument} en esta empresa.`);
        }
    }
    requireFields(kind, dto) {
        const missing = [];
        if (!dto.tipo_documento)
            missing.push('tipo_documento');
        if (!dto.num_document?.trim())
            missing.push('num_document');
        if (kind === 'seller') {
            if (!dto.nombres?.trim())
                missing.push('nombres');
            if (!dto.apellidos?.trim())
                missing.push('apellidos');
        }
        else if (!dto.razon_social?.trim()) {
            missing.push('razon_social');
        }
        if (missing.length)
            throw new common_1.BadRequestException(`Faltan campos obligatorios: ${missing.join(', ')}.`);
    }
    base(e) {
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
    toItem(kind, e) {
        if (kind === 'customer')
            return { ...this.base(e), razon_social: e.razon_social, nombre_comercial: e.nombre_comercial ?? undefined, ciudad: e.ciudad ?? undefined };
        if (kind === 'provider')
            return { ...this.base(e), razon_social: e.razon_social, nombre_comercial: e.nombre_comercial ?? undefined, forma_pago: e.forma_pago, banco: e.banco ?? undefined, num_cuenta: e.num_cuenta ?? undefined };
        return { ...this.base(e), nombres: e.nombres, apellidos: e.apellidos, comision_pct: Number(e.comision_pct) };
    }
    trimStrings(dto) {
        const out = {};
        for (const [k, v] of Object.entries(dto)) {
            if (v === undefined)
                continue;
            out[k] = typeof v === 'string' ? v.trim() : v;
        }
        return out;
    }
    async list(kind, companyId) {
        const rows = await this.repo(kind).find({ where: { company_id: companyId, deleted: false }, order: { id: 'DESC' } });
        return rows.map((r) => this.toItem(kind, r));
    }
    async findEntity(kind, id, companyId) {
        const entity = await this.repo(kind).findOne({ where: { id, company_id: companyId, deleted: false } });
        if (!entity)
            throw new common_1.NotFoundException(`${LABEL[kind]} no encontrado.`);
        return entity;
    }
    async get(kind, id, companyId) {
        return this.toItem(kind, await this.findEntity(kind, id, companyId));
    }
    async create(kind, dto, companyId, userId) {
        const data = this.trimStrings(dto);
        this.requireFields(kind, data);
        data.num_document = this.validateDocument(kind, data.tipo_documento, data.num_document);
        await this.assertUnique(kind, companyId, data.num_document);
        const repo = this.repo(kind);
        const saved = await repo.save(repo.create({ ...data, company_id: companyId, created_by: userId, estado: data.estado || 'activo', deleted: false }));
        return this.toItem(kind, saved);
    }
    async update(kind, id, dto, companyId) {
        const entity = await this.findEntity(kind, id, companyId);
        const data = this.trimStrings(dto);
        if (data.tipo_documento !== undefined || data.num_document !== undefined) {
            data.num_document = this.validateDocument(kind, data.tipo_documento ?? entity.tipo_documento, data.num_document ?? entity.num_document);
            await this.assertUnique(kind, companyId, data.num_document, entity.id);
        }
        if (kind === 'seller') {
            if (data.nombres === '' || data.apellidos === '')
                throw new common_1.BadRequestException('Nombres y apellidos no pueden quedar vacíos.');
        }
        else if (data.razon_social === '') {
            throw new common_1.BadRequestException('La razón social no puede quedar vacía.');
        }
        Object.assign(entity, data);
        return this.toItem(kind, await this.repo(kind).save(entity));
    }
    async toggleStatus(kind, id, companyId) {
        const entity = await this.findEntity(kind, id, companyId);
        entity.estado = entity.estado === 'activo' ? 'inactivo' : 'activo';
        return this.toItem(kind, await this.repo(kind).save(entity));
    }
    async remove(kind, id, companyId) {
        const entity = await this.findEntity(kind, id, companyId);
        entity.deleted = true;
        await this.repo(kind).save(entity);
        return { success: true };
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contacts_orm_entity_1.CustomerOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(contacts_orm_entity_1.ProviderOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(contacts_orm_entity_1.SellerOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map