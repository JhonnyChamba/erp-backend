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
exports.EmissionPointService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const emission_point_orm_entity_1 = require("../infrastructure/persistence/emission-point.orm-entity");
const branch_company_orm_entity_1 = require("../../branch-company/infrastructure/persistence/branch-company.orm-entity");
const DEFAULT_DOC_TYPES = [
    { type: 'FACTURAS', code: '01' },
    { type: 'NOTAS DE CRÉDITO', code: '04' },
    { type: 'GUÍAS DE REMISIÓN', code: '06' },
    { type: 'NOTAS DE DÉBITO', code: '05' },
];
let EmissionPointService = class EmissionPointService {
    pointRepo;
    sequenceRepo;
    branchRepo;
    dataSource;
    constructor(pointRepo, sequenceRepo, branchRepo, dataSource) {
        this.pointRepo = pointRepo;
        this.sequenceRepo = sequenceRepo;
        this.branchRepo = branchRepo;
        this.dataSource = dataSource;
    }
    normalizeSerie(serie) {
        const trimmed = (serie || '').trim();
        if (/^\d+$/.test(trimmed)) {
            return trimmed.padStart(3, '0');
        }
        return trimmed;
    }
    async listEmissionPoints(companyId, branchId) {
        const qb = this.pointRepo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.branch', 'b')
            .leftJoinAndSelect('p.sequences', 's')
            .where('p.company_id = :companyId AND p.deleted = false', { companyId });
        if (branchId) {
            qb.andWhere('p.branch_id = :branchId', { branchId });
        }
        qb.orderBy('b.code', 'ASC').addOrderBy('p.serie', 'ASC').addOrderBy('s.id', 'ASC');
        return await qb.getMany();
    }
    async getEmissionPointById(id, companyId) {
        const point = await this.pointRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
            relations: ['branch', 'sequences'],
            order: { sequences: { id: 'ASC' } },
        });
        if (!point) {
            throw new common_1.NotFoundException('Punto de emisión no encontrado');
        }
        return point;
    }
    async createEmissionPoint(companyId, dto, userId) {
        const branch = await this.branchRepo.findOne({
            where: { id: dto.branch_id, company: { id: companyId }, deleted: false },
        });
        if (!branch) {
            throw new common_1.NotFoundException('La sucursal seleccionada no existe en la empresa');
        }
        const serie = this.normalizeSerie(dto.serie);
        const existing = await this.pointRepo.findOne({
            where: {
                company: { id: companyId },
                branch: { id: branch.id },
                serie,
                deleted: false,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Ya existe un punto de emisión con la serie "${serie}" en la sucursal "${branch.name}".`);
        }
        return await this.dataSource.transaction(async (manager) => {
            const pointEntity = manager.create(emission_point_orm_entity_1.EmissionPointOrmEntity, {
                company: { id: companyId },
                branch: { id: branch.id },
                description: dto.description.trim(),
                serie,
                enabled: true,
                deleted: false,
                created_by: userId || null,
            });
            const savedPoint = await manager.save(emission_point_orm_entity_1.EmissionPointOrmEntity, pointEntity);
            const initialCorrelative = Number(dto.initial_correlative || 0);
            for (const doc of DEFAULT_DOC_TYPES) {
                const seqEntity = manager.create(emission_point_orm_entity_1.EmissionPointSequenceOrmEntity, {
                    company: { id: companyId },
                    emission_point: { id: savedPoint.id },
                    document_type: doc.type,
                    document_code: doc.code,
                    serie,
                    correlative: doc.type === 'FACTURAS' ? initialCorrelative : 0,
                    enabled: true,
                });
                await manager.save(emission_point_orm_entity_1.EmissionPointSequenceOrmEntity, seqEntity);
            }
            return await manager.findOne(emission_point_orm_entity_1.EmissionPointOrmEntity, {
                where: { id: savedPoint.id },
                relations: ['branch', 'sequences'],
                order: { sequences: { id: 'ASC' } },
            });
        });
    }
    async updateEmissionPoint(id, companyId, dto) {
        const point = await this.getEmissionPointById(id, companyId);
        if (dto.description !== undefined) {
            point.description = dto.description.trim();
        }
        if (dto.enabled !== undefined) {
            point.enabled = Boolean(dto.enabled);
        }
        if (dto.serie !== undefined) {
            const newSerie = this.normalizeSerie(dto.serie);
            if (newSerie !== point.serie) {
                const duplicate = await this.pointRepo.findOne({
                    where: {
                        company: { id: companyId },
                        branch: { id: point.branch.id },
                        serie: newSerie,
                        deleted: false,
                    },
                });
                if (duplicate && duplicate.id !== point.id) {
                    throw new common_1.BadRequestException(`Ya existe la serie "${newSerie}" en esta sucursal.`);
                }
                point.serie = newSerie;
                await this.sequenceRepo.update({ emission_point: { id: point.id } }, { serie: newSerie });
            }
        }
        await this.pointRepo.save(point);
        return await this.getEmissionPointById(id, companyId);
    }
    async deleteEmissionPoint(id, companyId) {
        const point = await this.getEmissionPointById(id, companyId);
        point.deleted = true;
        point.enabled = false;
        await this.pointRepo.save(point);
        return { deleted: true, id };
    }
    async updateSequenceCorrelative(sequenceId, companyId, dto) {
        const seq = await this.sequenceRepo.findOne({
            where: { id: sequenceId, company: { id: companyId } },
            relations: ['emission_point'],
        });
        if (!seq) {
            throw new common_1.NotFoundException('Secuencia no encontrada');
        }
        seq.correlative = Number(dto.correlative);
        await this.sequenceRepo.save(seq);
        return seq;
    }
    async getNextSequential(companyId, branchId, emissionPointId, serieParam, documentType = 'FACTURAS') {
        const branch = await this.branchRepo.findOne({
            where: { id: branchId, company: { id: companyId }, deleted: false },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Sucursal no encontrada');
        }
        let point = null;
        if (emissionPointId) {
            point = await this.pointRepo.findOne({
                where: { id: emissionPointId, company: { id: companyId }, deleted: false },
                relations: ['sequences'],
            });
        }
        else if (serieParam) {
            const serie = this.normalizeSerie(serieParam);
            point = await this.pointRepo.findOne({
                where: { branch: { id: branchId }, serie, company: { id: companyId }, deleted: false },
                relations: ['sequences'],
            });
        }
        if (!point) {
            point = await this.pointRepo.findOne({
                where: { branch: { id: branchId }, company: { id: companyId }, enabled: true, deleted: false },
                relations: ['sequences'],
                order: { id: 'ASC' },
            });
        }
        if (!point) {
            const serie = this.normalizeSerie(branch.emission_point || '001');
            point = (await this.createEmissionPoint(companyId, {
                branch_id: branch.id,
                description: `Punto de Venta (${branch.name})`,
                serie,
                initial_correlative: 0,
            }));
        }
        let seq = point.sequences?.find((s) => s.document_type === documentType);
        if (!seq) {
            const docInfo = DEFAULT_DOC_TYPES.find((d) => d.type === documentType) || { type: documentType, code: '01' };
            seq = this.sequenceRepo.create({
                company: { id: companyId },
                emission_point: { id: point.id },
                document_type: docInfo.type,
                document_code: docInfo.code,
                serie: point.serie,
                correlative: 0,
                enabled: true,
            });
            seq = await this.sequenceRepo.save(seq);
        }
        const currentCorrelative = Number(seq.correlative || 0);
        const nextCorrelative = currentCorrelative + 1;
        const sequentialPadded = String(nextCorrelative).padStart(9, '0');
        const establishmentPadded = String(branch.code || '001').padStart(3, '0');
        const emissionPointPadded = String(point.serie || '001').padStart(3, '0');
        return {
            establishment: establishmentPadded,
            emission_point: emissionPointPadded,
            emission_point_id: point.id,
            emission_point_description: point.description,
            document_type: documentType,
            current_correlative: currentCorrelative,
            next_correlative: nextCorrelative,
            sequential: sequentialPadded,
            full_invoice_number: `${establishmentPadded}-${emissionPointPadded}-${sequentialPadded}`,
        };
    }
    async syncAndIncrementCorrelative(companyId, branchId, serie, sequentialNumber, documentType = 'FACTURAS', externalManager) {
        const runner = async (manager) => {
            const normalizedSerie = this.normalizeSerie(serie);
            let point = await manager.findOne(emission_point_orm_entity_1.EmissionPointOrmEntity, {
                where: { branch: { id: branchId }, serie: normalizedSerie, company: { id: companyId }, deleted: false },
            });
            if (!point) {
                point = await manager.findOne(emission_point_orm_entity_1.EmissionPointOrmEntity, {
                    where: { company: { id: companyId }, serie: normalizedSerie, deleted: false },
                });
            }
            if (point) {
                const seq = await manager.findOne(emission_point_orm_entity_1.EmissionPointSequenceOrmEntity, {
                    where: { emission_point: { id: point.id }, document_type: documentType },
                });
                if (seq) {
                    const newCorrelative = Math.max(Number(seq.correlative || 0), sequentialNumber);
                    seq.correlative = newCorrelative;
                    await manager.save(emission_point_orm_entity_1.EmissionPointSequenceOrmEntity, seq);
                }
            }
        };
        if (externalManager) {
            await runner(externalManager);
        }
        else {
            await this.dataSource.transaction(runner);
        }
    }
};
exports.EmissionPointService = EmissionPointService;
exports.EmissionPointService = EmissionPointService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(emission_point_orm_entity_1.EmissionPointOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(emission_point_orm_entity_1.EmissionPointSequenceOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(branch_company_orm_entity_1.BranchCompanyOrmEntity)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], EmissionPointService);
//# sourceMappingURL=emission-point.service.js.map