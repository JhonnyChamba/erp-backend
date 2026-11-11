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
exports.CreditNoteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const credit_note_orm_entity_1 = require("../infrastructure/persistence/credit-note.orm-entity");
const invoice_orm_entity_1 = require("../infrastructure/persistence/invoice.orm-entity");
const inventory_orm_entity_1 = require("../../inventory/infrastructure/persistence/inventory.orm-entity");
const inventory_service_1 = require("../../inventory/application/inventory.service");
const branch_company_orm_entity_1 = require("../../branch-company/infrastructure/persistence/branch-company.orm-entity");
const company_orm_entity_1 = require("../../company/infrastructure/persistence/company.orm-entity");
const secret_crypto_1 = require("../../../common/crypto/secret-crypto");
const sri_xml_builder_1 = require("./sri-xml.builder");
const sri_signer_1 = require("./sri-signer");
const sri_client_1 = require("./sri-client");
let CreditNoteService = class CreditNoteService {
    creditNoteRepo;
    detailRepo;
    invoiceRepo;
    companyRepo;
    inventoryService;
    dataSource;
    constructor(creditNoteRepo, detailRepo, invoiceRepo, companyRepo, inventoryService, dataSource) {
        this.creditNoteRepo = creditNoteRepo;
        this.detailRepo = detailRepo;
        this.invoiceRepo = invoiceRepo;
        this.companyRepo = companyRepo;
        this.inventoryService = inventoryService;
        this.dataSource = dataSource;
    }
    generateSRIAccessKey(issueDate, ruc, establishment, emissionPoint, sequential, environment = '1') {
        const cleanDate = issueDate.replace(/-/g, '');
        const parts = cleanDate.match(/^(\d{4})(\d{2})(\d{2})$/);
        const ddmmyyyy = parts ? `${parts[3]}${parts[2]}${parts[1]}` : cleanDate;
        const docType = '04';
        const paddedRuc = ruc.padEnd(13, '0').slice(0, 13);
        const serie = `${establishment.padStart(3, '0')}${emissionPoint.padStart(3, '0')}`;
        const seq = sequential.padStart(9, '0');
        const numericCode = String((0, crypto_1.randomInt)(0, 100_000_000)).padStart(8, '0');
        const emissionType = '1';
        const raw48 = `${ddmmyyyy}${docType}${paddedRuc}${environment}${serie}${seq}${numericCode}${emissionType}`;
        let factor = 2;
        let sum = 0;
        for (let i = raw48.length - 1; i >= 0; i--) {
            sum += parseInt(raw48[i], 10) * factor;
            factor = factor === 7 ? 2 : factor + 1;
        }
        const mod11 = 11 - (sum % 11);
        let verifier = String(mod11);
        if (mod11 === 11)
            verifier = '0';
        else if (mod11 === 10)
            verifier = '1';
        return `${raw48}${verifier}`;
    }
    async getNextSequential(manager, companyId, branchId, establishment, emissionPoint) {
        let currentCorrelative = 0;
        try {
            const seqRow = await manager.query(`
				SELECT s.id, s.correlative
				FROM tab_emission_point_sequence s
				JOIN tab_emission_point p ON p.id = s.emission_point_id
				WHERE p.company_id = $1 
				  AND p.branch_id = $2
				  AND p.serie = $3
				  AND s.document_type = 'NOTAS DE CRÉDITO'
				LIMIT 1;
			`, [companyId, branchId, emissionPoint]);
            if (seqRow && seqRow.length > 0) {
                currentCorrelative = Number(seqRow[0].correlative || 0);
            }
        }
        catch (e) {
            console.error('Error fetching emission sequence for NOTAS DE CRÉDITO:', e);
        }
        const last = await manager.getRepository(credit_note_orm_entity_1.CreditNoteOrmEntity).findOne({
            where: {
                company: { id: companyId },
                establishment,
                emission_point: emissionPoint,
            },
            order: { id: 'DESC' },
            select: ['id', 'sequential'],
        });
        let lastNum = 0;
        if (last?.sequential) {
            const parsed = parseInt(last.sequential, 10);
            if (!isNaN(parsed))
                lastNum = parsed;
        }
        const nextNum = Math.max(currentCorrelative + 1, lastNum + 1);
        return String(nextNum).padStart(9, '0');
    }
    async create(dto, companyId, userId) {
        if (!dto.details || dto.details.length === 0) {
            throw new common_1.BadRequestException('La nota de crédito debe contener al menos un ítem o concepto en el detalle.');
        }
        if (!dto.reason || !dto.reason.trim()) {
            throw new common_1.BadRequestException('El motivo de emisión de la nota de crédito es obligatorio según el SRI.');
        }
        const saved = await this.dataSource.transaction((manager) => this.createInTransaction(manager, dto, companyId, userId));
        try {
            const company = await this.companyRepo.findOne({ where: { id: companyId }, select: ['id', 'auto_send_sri'] });
            if (company?.auto_send_sri) {
                try {
                    const sriResult = await this.sendToSri(saved.id, companyId);
                    return {
                        ...saved,
                        sri_result: sriResult,
                    };
                }
                catch (err) {
                    const errorMsg = err?.message || 'Error inesperado al enviar la nota de crédito al SRI.';
                    const fallbackMessages = [{ identificador: 'ERR-ENVIO', mensaje: errorMsg, tipo: 'ERROR' }];
                    await this.creditNoteRepo.update({ id: saved.id }, { sri_status: 'RETURNED', sri_messages: fallbackMessages });
                    return {
                        ...saved,
                        sri_result: {
                            id: saved.id,
                            success: false,
                            status: 'RETURNED',
                            sri_status: 'RETURNED',
                            message: errorMsg,
                            sri_authorization_number: null,
                            authorizationNumber: null,
                            sri_authorization_date: null,
                            authorizationDate: null,
                            sri_messages: fallbackMessages,
                            sriMessages: fallbackMessages,
                            error: errorMsg,
                        },
                    };
                }
            }
        }
        catch (compErr) {
            console.error('Error verificando envío automático al SRI en nota de crédito:', compErr);
        }
        return saved;
    }
    async createInTransaction(manager, dto, companyId, userId) {
        const cnRepo = manager.getRepository(credit_note_orm_entity_1.CreditNoteOrmEntity);
        const detailRepo = manager.getRepository(credit_note_orm_entity_1.CreditNoteDetailOrmEntity);
        await manager.query('SELECT id FROM tab_company WHERE id = $1 FOR UPDATE', [companyId]);
        const company = await manager.getRepository(company_orm_entity_1.CompanyOrmEntity).findOne({ where: { id: companyId } });
        if (!company)
            throw new common_1.NotFoundException('Empresa no encontrada.');
        if (!company.ruc || !/^[0-9]{13}$/.test(company.ruc.trim())) {
            throw new common_1.BadRequestException('La empresa no tiene un RUC válido de 13 dígitos configurado.');
        }
        const branch = await manager.getRepository(branch_company_orm_entity_1.BranchCompanyOrmEntity).findOne({
            where: { id: dto.branchId, company: { id: companyId }, deleted: false },
        });
        if (!branch)
            throw new common_1.BadRequestException('La sucursal indicada no existe en esta empresa.');
        if (!branch.enabled)
            throw new common_1.BadRequestException(`La sucursal ${branch.code} - ${branch.name} está deshabilitada.`);
        const establishment = branch.code.padStart(3, '0');
        const emissionPoint = (dto.emission_point || branch.emission_point || '001').padStart(3, '0');
        const sequential = await this.getNextSequential(manager, companyId, branch.id, establishment, emissionPoint);
        const creditNoteNumber = `${establishment}-${emissionPoint}-${sequential}`;
        const issueDate = dto.issue_date || new Date().toISOString().slice(0, 10);
        const accessKey = this.generateSRIAccessKey(issueDate, company.ruc.trim(), establishment, emissionPoint, sequential, company.sri_environment || '1');
        let originalInvoice = null;
        if (dto.invoiceId) {
            originalInvoice = await manager.getRepository(invoice_orm_entity_1.InvoiceOrmEntity).findOne({
                where: { id: dto.invoiceId, company: { id: companyId } },
            });
            if (!originalInvoice) {
                throw new common_1.NotFoundException(`La factura ID ${dto.invoiceId} no existe en esta empresa.`);
            }
        }
        const customerIdType = dto.customer_id_type || originalInvoice?.customer_id_type || '05';
        const customerIdNumber = (dto.customer_id_number || originalInvoice?.customer_id_number || '').trim();
        const customerName = (dto.customer_name || originalInvoice?.customer_name || '').trim();
        const customerAddress = (dto.customer_address || originalInvoice?.customer_address || '').trim();
        const customerEmail = (dto.customer_email || originalInvoice?.customer_email || '').trim();
        const customerPhone = (dto.customer_phone || originalInvoice?.customer_phone || '').trim();
        const modifiedDocNumber = dto.modified_document_number || originalInvoice?.invoice_number || '';
        const modifiedDocDate = dto.modified_document_date || originalInvoice?.issue_date || issueDate;
        if (!modifiedDocNumber) {
            throw new common_1.BadRequestException('Debe especificar el número de la factura modificada.');
        }
        let defaultWarehouseId = originalInvoice?.warehouse_id || null;
        if (!defaultWarehouseId) {
            const activeWhs = await manager.getRepository(inventory_orm_entity_1.InventoryWarehouseOrmEntity).find({
                where: { company: { id: companyId }, deleted: false, enabled: true },
                order: { is_default: 'DESC', id: 'ASC' },
            });
            if (activeWhs.length > 0) {
                defaultWarehouseId = activeWhs[0].id;
            }
        }
        let subtotalZero = 0;
        let subtotalTaxable = 0;
        let discountTotal = 0;
        let taxTotal = 0;
        const detailEntities = [];
        const shouldAdjustInventory = dto.adjust_inventory !== false;
        for (const d of dto.details) {
            const qty = Number(d.quantity || 1);
            const unitPrice = Number(d.unit_price || 0);
            const discount = Number(d.discount || 0);
            const taxRate = Number(d.tax_rate ?? 15);
            const rowSubtotal = Math.max(0, qty * unitPrice - discount);
            const rowTax = Number(((rowSubtotal * taxRate) / 100).toFixed(2));
            const rowTotal = Number((rowSubtotal + rowTax).toFixed(2));
            if (taxRate > 0) {
                subtotalTaxable += rowSubtotal;
            }
            else {
                subtotalZero += rowSubtotal;
            }
            discountTotal += discount;
            taxTotal += rowTax;
            const detailWarehouseId = d.warehouse_id || defaultWarehouseId;
            const detail = detailRepo.create({
                item_type: d.item_type || 'PRODUCT',
                item_id: d.item_id,
                warehouse_id: detailWarehouseId || null,
                code: d.code || '',
                description: d.description,
                quantity: qty,
                unit_price: unitPrice,
                discount,
                tax_rate: taxRate,
                tax_value: rowTax,
                subtotal: rowSubtotal,
                total: rowTotal,
            });
            detailEntities.push(detail);
            const isPhysical = d.item_type === 'PRODUCT' || d.item_type === 'ITEM';
            if (shouldAdjustInventory && isPhysical && d.item_id && detailWarehouseId) {
                await this.inventoryService.registerEntry({
                    companyId,
                    warehouseId: detailWarehouseId,
                    productId: d.item_id,
                    quantity: qty,
                    movementReason: 'CUSTOMER_RETURN',
                    collectionOriginName: 'CREDIT_NOTE',
                    collectionOriginDocument: creditNoteNumber,
                    createdUserId: userId,
                }, manager);
            }
        }
        const total = Number((subtotalTaxable + subtotalZero + taxTotal).toFixed(2));
        const creditNote = cnRepo.create({
            company: { id: companyId },
            invoice: originalInvoice ? { id: originalInvoice.id } : null,
            branch_id: branch.id,
            branch_address: branch.address,
            establishment,
            emission_point: emissionPoint,
            sequential,
            credit_note_number: creditNoteNumber,
            issue_date: issueDate,
            modified_document_type: dto.modified_document_type || '01',
            modified_document_number: modifiedDocNumber,
            modified_document_date: modifiedDocDate,
            reason: dto.reason.trim(),
            customer_id_type: customerIdType,
            customer_id_number: customerIdNumber,
            customer_name: customerName,
            customer_address: customerAddress,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            access_key: accessKey,
            status: 'ISSUED',
            subtotal_zero_tax: Number(subtotalZero.toFixed(2)),
            subtotal_taxable: Number(subtotalTaxable.toFixed(2)),
            subtotal: Number((subtotalZero + subtotalTaxable).toFixed(2)),
            discount_total: Number(discountTotal.toFixed(2)),
            tax_total: Number(taxTotal.toFixed(2)),
            total,
            adjust_inventory: shouldAdjustInventory,
            notes: dto.notes || '',
            created_by: userId,
            enabled: true,
            deleted: false,
            details: detailEntities,
        });
        const saved = await cnRepo.save(creditNote);
        try {
            const numericSeq = parseInt(sequential, 10);
            if (!isNaN(numericSeq)) {
                await manager.query(`
					UPDATE tab_emission_point_sequence s
					SET correlative = $1, updated_at = NOW()
					FROM tab_emission_point p
					WHERE s.emission_point_id = p.id
					  AND p.company_id = $2
					  AND p.branch_id = $3
					  AND p.serie = $4
					  AND s.document_type = 'NOTAS DE CRÉDITO'
					  AND s.correlative < $1;
				`, [numericSeq, companyId, branch.id, emissionPoint]);
            }
        }
        catch (seqErr) {
            console.error('Error actualizando correlativo de NOTAS DE CRÉDITO:', seqErr);
        }
        return saved;
    }
    async list(companyId, options) {
        const qb = this.creditNoteRepo
            .createQueryBuilder('cn')
            .leftJoinAndSelect('cn.details', 'details')
            .leftJoinAndSelect('cn.invoice', 'invoice')
            .where('cn.company_id = :companyId', { companyId })
            .andWhere('cn.deleted = false')
            .orderBy('cn.id', 'DESC');
        if (options?.branchId) {
            qb.andWhere('cn.branch_id = :branchId', { branchId: options.branchId });
        }
        if (options?.invoiceId) {
            qb.andWhere('cn.invoice_id = :invoiceId', { invoiceId: options.invoiceId });
        }
        if (options?.search) {
            qb.andWhere('(cn.credit_note_number ILIKE :s OR cn.customer_name ILIKE :s OR cn.customer_id_number ILIKE :s OR cn.modified_document_number ILIKE :s)', { s: `%${options.search}%` });
        }
        return qb.getMany();
    }
    async findById(id, companyId) {
        const cn = await this.creditNoteRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
            relations: ['details', 'invoice', 'company'],
        });
        if (!cn)
            throw new common_1.NotFoundException('Nota de crédito no encontrada.');
        return cn;
    }
    async getNextSequentialPreview(companyId, branchId, emissionPoint) {
        return this.getNextSequential(this.creditNoteRepo.manager, companyId, branchId, '001', emissionPoint);
    }
    async sendToSri(id, companyId) {
        const cn = await this.findById(id, companyId);
        const company = await this.companyRepo
            .createQueryBuilder('c')
            .addSelect(['c.cert_p12_base64', 'c.cert_password_enc'])
            .where('c.id = :companyId', { companyId })
            .getOne();
        if (!company)
            throw new common_1.NotFoundException('Empresa no encontrada.');
        if (cn.sri_status === 'AUTHORIZED') {
            return {
                id,
                success: true,
                status: 'AUTHORIZED',
                sri_status: 'AUTHORIZED',
                message: 'Esta nota de crédito ya está autorizada por el SRI.',
                authorizationNumber: cn.sri_authorization_number,
                sri_authorization_number: cn.sri_authorization_number,
                authorizationDate: cn.sri_authorization_date,
                sri_authorization_date: cn.sri_authorization_date,
                sri_messages: cn.sri_messages || [],
                sriMessages: cn.sri_messages || [],
            };
        }
        let signedXml;
        if (cn.sign_status === 'SIGNED' && cn.signed_xml) {
            signedXml = cn.signed_xml;
        }
        else {
            if (!company.cert_p12_base64 || !company.cert_password_enc) {
                throw new common_1.BadRequestException('La empresa no tiene configurada la firma electrónica (.p12) en Configuración > Empresas.');
            }
            const parsedP12 = (0, sri_signer_1.loadP12)(company.cert_p12_base64, (0, secret_crypto_1.decryptSecret)(company.cert_password_enc));
            if (parsedP12.notAfter.getTime() < Date.now()) {
                throw new common_1.BadRequestException(`La firma electrónica caducó el ${parsedP12.notAfter.toISOString().slice(0, 10)}.`);
            }
            const canonicalXml = (0, sri_xml_builder_1.buildCreditNoteXml)(cn, company);
            signedXml = (0, sri_signer_1.signXadesBes)(canonicalXml, parsedP12);
            cn.signed_xml = signedXml;
            cn.signed_at = new Date();
            cn.sign_status = 'SIGNED';
            await this.creditNoteRepo.save(cn);
        }
        const env = (company.sri_environment || '1');
        const receptionRes = await (0, sri_client_1.sriReception)(signedXml, env);
        cn.sri_sent_at = new Date();
        if (receptionRes.estado !== 'RECIBIDA') {
            cn.sri_status = 'RETURNED';
            cn.sri_messages = receptionRes.mensajes || [];
            cn.sri_response_xml = receptionRes.rawXml || null;
            await this.creditNoteRepo.save(cn);
            return {
                id,
                success: false,
                status: 'RETURNED',
                sri_status: 'RETURNED',
                message: 'El SRI devolvió la nota de crédito por inconsistencias.',
                sri_messages: cn.sri_messages,
                sriMessages: cn.sri_messages,
            };
        }
        await (0, sri_client_1.sleep)(2000);
        let authResult = await (0, sri_client_1.sriAuthorization)(cn.access_key, env);
        for (let retry = 0; retry < 3 && authResult.estado === 'EN PROCESO'; retry++) {
            await (0, sri_client_1.sleep)(2000);
            authResult = await (0, sri_client_1.sriAuthorization)(cn.access_key, env);
        }
        cn.sri_response_xml = authResult.rawXml || null;
        cn.sri_messages = authResult.mensajes;
        if (authResult.estado === 'AUTORIZADO') {
            cn.sri_status = 'AUTHORIZED';
            cn.status = 'AUTHORIZED';
            cn.sri_authorization_number = authResult.numeroAutorizacion || cn.access_key;
            cn.sri_authorization_date = authResult.fechaAutorizacion ? new Date(authResult.fechaAutorizacion) : new Date();
            await this.creditNoteRepo.save(cn);
            return {
                id,
                success: true,
                status: 'AUTHORIZED',
                sri_status: 'AUTHORIZED',
                message: 'Nota de crédito AUTORIZADA correctamente por el SRI.',
                authorizationNumber: cn.sri_authorization_number,
                sri_authorization_number: cn.sri_authorization_number,
                authorizationDate: cn.sri_authorization_date,
                sri_authorization_date: cn.sri_authorization_date,
                sri_messages: cn.sri_messages || [],
                sriMessages: cn.sri_messages || [],
            };
        }
        if (authResult.estado === 'NO AUTORIZADO') {
            cn.sri_status = 'NOT_AUTHORIZED';
            await this.creditNoteRepo.save(cn);
            return {
                id,
                success: false,
                status: 'NOT_AUTHORIZED',
                sri_status: 'NOT_AUTHORIZED',
                message: 'La nota de crédito NO fue autorizada por el SRI.',
                sri_messages: cn.sri_messages || [],
                sriMessages: cn.sri_messages || [],
            };
        }
        cn.sri_status = 'IN_PROCESS';
        await this.creditNoteRepo.save(cn);
        return {
            id,
            success: true,
            status: 'IN_PROCESS',
            sri_status: 'IN_PROCESS',
            message: 'La nota de crédito fue RECIBIDA por el SRI y se encuentra en procesamiento.',
            sri_messages: cn.sri_messages || [],
            sriMessages: cn.sri_messages || [],
        };
    }
    async getSignedXml(id, companyId) {
        const cn = await this.creditNoteRepo
            .createQueryBuilder('cn')
            .addSelect('cn.signed_xml')
            .where('cn.id = :id AND cn.company_id = :companyId AND cn.deleted = false', { id, companyId })
            .getOne();
        if (!cn || !cn.signed_xml) {
            throw new common_1.NotFoundException('La nota de crédito no tiene un XML firmado disponible.');
        }
        return cn.signed_xml;
    }
};
exports.CreditNoteService = CreditNoteService;
exports.CreditNoteService = CreditNoteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(credit_note_orm_entity_1.CreditNoteOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(credit_note_orm_entity_1.CreditNoteDetailOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_orm_entity_1.InvoiceOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __param(5, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        inventory_service_1.InventoryService,
        typeorm_2.DataSource])
], CreditNoteService);
//# sourceMappingURL=credit-note.service.js.map