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
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const invoice_orm_entity_1 = require("../infrastructure/persistence/invoice.orm-entity");
const inventory_orm_entity_1 = require("../../inventory/infrastructure/persistence/inventory.orm-entity");
const branch_company_orm_entity_1 = require("../../branch-company/infrastructure/persistence/branch-company.orm-entity");
const company_orm_entity_1 = require("../../company/infrastructure/persistence/company.orm-entity");
const secret_crypto_1 = require("../../../common/crypto/secret-crypto");
const sri_xml_builder_1 = require("./sri-xml.builder");
const sri_signer_1 = require("./sri-signer");
let InvoiceService = class InvoiceService {
    invoiceRepo;
    detailRepo;
    inventoryItemRepo;
    companyRepo;
    dataSource;
    constructor(invoiceRepo, detailRepo, inventoryItemRepo, companyRepo, dataSource) {
        this.invoiceRepo = invoiceRepo;
        this.detailRepo = detailRepo;
        this.inventoryItemRepo = inventoryItemRepo;
        this.companyRepo = companyRepo;
        this.dataSource = dataSource;
    }
    generateSRIAccessKey(issueDate, ruc, establishment, emissionPoint, sequential, environment = '1') {
        const cleanDate = issueDate.replace(/-/g, '');
        const parts = cleanDate.match(/^(\d{4})(\d{2})(\d{2})$/);
        const ddmmyyyy = parts ? `${parts[3]}${parts[2]}${parts[1]}` : cleanDate;
        const docType = '01';
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
    async getNextSequential(manager, companyId, establishment, emissionPoint) {
        const last = await manager.getRepository(invoice_orm_entity_1.InvoiceOrmEntity).findOne({
            where: {
                company: { id: companyId },
                establishment,
                emission_point: emissionPoint,
            },
            order: { id: 'DESC' },
            select: ['id', 'sequential'],
        });
        let nextNum = 1;
        if (last?.sequential) {
            const parsed = parseInt(last.sequential, 10);
            if (!isNaN(parsed))
                nextNum = parsed + 1;
        }
        return String(nextNum).padStart(9, '0');
    }
    async create(dto, companyId, userId) {
        if (!dto.details || dto.details.length === 0) {
            throw new common_1.BadRequestException('La factura debe tener al menos un ítem o servicio en el detalle.');
        }
        return this.dataSource.transaction((manager) => this.createInTransaction(manager, dto, companyId, userId));
    }
    async createInTransaction(manager, dto, companyId, userId) {
        const invoiceRepo = manager.getRepository(invoice_orm_entity_1.InvoiceOrmEntity);
        const detailRepo = manager.getRepository(invoice_orm_entity_1.InvoiceDetailOrmEntity);
        const inventoryItemRepo = manager.getRepository(inventory_orm_entity_1.InventoryItemOrmEntity);
        await manager.query('SELECT id FROM tab_company WHERE id = $1 FOR UPDATE', [companyId]);
        const company = await manager.getRepository(company_orm_entity_1.CompanyOrmEntity).findOne({ where: { id: companyId } });
        if (!company)
            throw new common_1.NotFoundException('Empresa no encontrada.');
        if (!company.ruc || !/^[0-9]{13}$/.test(company.ruc.trim())) {
            throw new common_1.BadRequestException('La empresa emisora no tiene un RUC válido de 13 dígitos. Configúralo antes de facturar.');
        }
        const branch = await manager.getRepository(branch_company_orm_entity_1.BranchCompanyOrmEntity).findOne({ where: { id: dto.branchId, company: { id: companyId }, deleted: false } });
        if (!branch)
            throw new common_1.BadRequestException('La sucursal indicada no existe en esta empresa.');
        if (!branch.enabled)
            throw new common_1.BadRequestException(`La sucursal ${branch.code} - ${branch.name} está deshabilitada.`);
        const establishment = branch.code.padStart(3, '0');
        const emissionPoint = (dto.emission_point || branch.emission_point || '001').padStart(3, '0');
        if (!/^[0-9]{3}$/.test(establishment) || !/^[0-9]{3}$/.test(emissionPoint)) {
            throw new common_1.BadRequestException('El establecimiento y el punto de emisión deben tener 3 dígitos (corrige el código de la sucursal).');
        }
        const sequential = await this.getNextSequential(manager, companyId, establishment, emissionPoint);
        const invoiceNumber = `${establishment}-${emissionPoint}-${sequential}`;
        const issueDate = dto.issue_date || new Date().toISOString().slice(0, 10);
        const companyRuc = company.ruc.trim();
        const accessKey = this.generateSRIAccessKey(issueDate, companyRuc, establishment, emissionPoint, sequential, company.sri_environment || '1');
        let subtotalZero = 0;
        let subtotalTaxable = 0;
        let subtotalGross = 0;
        let discountTotal = 0;
        let taxTotal = 0;
        const detailEntities = [];
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
            subtotalGross += qty * unitPrice;
            discountTotal += discount;
            taxTotal += rowTax;
            const detail = detailRepo.create({
                item_type: d.item_type || 'ITEM',
                item_id: d.item_id,
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
            if (d.item_type === 'ITEM' && d.item_id) {
                const item = await inventoryItemRepo.findOne({ where: { id: d.item_id, company: { id: companyId } } });
                if (item) {
                    item.stock_current = Math.max(0, Number(item.stock_current || 0) - qty);
                    await inventoryItemRepo.save(item);
                }
            }
        }
        const total = Number((subtotalTaxable + subtotalZero + taxTotal).toFixed(2));
        const invoice = invoiceRepo.create({
            company: { id: companyId },
            establishment,
            emission_point: emissionPoint,
            branch_id: branch.id,
            branch_address: branch.address,
            sequential,
            invoice_number: invoiceNumber,
            issue_date: issueDate,
            customer_id_type: dto.customer_id_type || '05',
            customer_id_number: dto.customer_id_number.trim(),
            customer_name: dto.customer_name.trim(),
            customer_address: dto.customer_address?.trim() || '',
            customer_email: dto.customer_email?.trim() || '',
            customer_phone: dto.customer_phone?.trim() || '',
            payment_method: dto.payment_method || '01',
            access_key: accessKey,
            status: 'ISSUED',
            subtotal_zero_tax: Number(subtotalZero.toFixed(2)),
            subtotal_taxable: Number(subtotalTaxable.toFixed(2)),
            subtotal: Number((subtotalZero + subtotalTaxable).toFixed(2)),
            discount_total: Number(discountTotal.toFixed(2)),
            tax_total: Number(taxTotal.toFixed(2)),
            total,
            notes: dto.notes || '',
            created_by: userId,
            enabled: true,
            deleted: false,
            details: detailEntities,
        });
        const saved = await invoiceRepo.save(invoice);
        return saved;
    }
    async findAll(companyId, branchId) {
        return this.invoiceRepo.find({
            where: { company: { id: companyId }, deleted: false, ...(branchId ? { branch_id: branchId } : {}) },
            relations: ['details'],
            order: { id: 'DESC' },
        });
    }
    async findOne(id, companyId) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id, company: { id: companyId }, deleted: false },
            relations: ['details'],
        });
        if (!invoice)
            throw new common_1.NotFoundException('Factura no encontrada.');
        return invoice;
    }
    async cancel(id, companyId) {
        const invoice = await this.findOne(id, companyId);
        if (invoice.status === 'CANCELED')
            return invoice;
        return this.dataSource.transaction(async (manager) => {
            const itemRepo = manager.getRepository(inventory_orm_entity_1.InventoryItemOrmEntity);
            for (const d of invoice.details || []) {
                if (d.item_type === 'ITEM' && d.item_id) {
                    const item = await itemRepo.findOne({ where: { id: d.item_id, company: { id: companyId } } });
                    if (item) {
                        item.stock_current = Number(item.stock_current || 0) + Number(d.quantity || 0);
                        await itemRepo.save(item);
                    }
                }
            }
            invoice.status = 'CANCELED';
            return manager.getRepository(invoice_orm_entity_1.InvoiceOrmEntity).save(invoice);
        });
    }
    async sign(id, companyId) {
        const invoice = await this.findOne(id, companyId);
        if (invoice.status === 'CANCELED') {
            throw new common_1.BadRequestException('No se puede firmar una factura anulada.');
        }
        const company = await this.companyRepo
            .createQueryBuilder('c')
            .addSelect(['c.cert_p12_base64', 'c.cert_password_enc'])
            .where('c.id = :companyId', { companyId })
            .getOne();
        if (!company)
            throw new common_1.NotFoundException('Empresa no encontrada.');
        if (!company.cert_p12_base64 || !company.cert_password_enc) {
            throw new common_1.BadRequestException('La empresa no tiene firma electrónica. Cárgala en Configuración > Empresas > Firma electrónica.');
        }
        try {
            const xml = (0, sri_xml_builder_1.buildInvoiceXml)(invoice, company);
            const loaded = (0, sri_signer_1.loadP12)(company.cert_p12_base64, (0, secret_crypto_1.decryptSecret)(company.cert_password_enc));
            if (loaded.notAfter.getTime() < Date.now()) {
                throw new Error(`La firma electrónica caducó el ${loaded.notAfter.toISOString().slice(0, 10)}.`);
            }
            const signed = (0, sri_signer_1.signXadesBes)(xml, loaded);
            await this.invoiceRepo.update({ id }, { signed_xml: signed, signed_at: new Date(), sign_status: 'SIGNED' });
            return { id, sign_status: 'SIGNED', file_name: `${invoice.access_key}.xml` };
        }
        catch (e) {
            throw new common_1.BadRequestException(e?.message || 'No se pudo firmar la factura.');
        }
    }
    async getSignedXml(id, companyId) {
        const invoice = await this.invoiceRepo
            .createQueryBuilder('i')
            .addSelect('i.signed_xml')
            .where('i.id = :id AND i.company_id = :companyId AND i.deleted = false', { id, companyId })
            .getOne();
        if (!invoice)
            throw new common_1.NotFoundException('Factura no encontrada.');
        if (!invoice.signed_xml)
            throw new common_1.BadRequestException('La factura aún no está firmada.');
        return { file_name: `${invoice.access_key}.xml`, xml: invoice.signed_xml };
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_orm_entity_1.InvoiceOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_orm_entity_1.InvoiceDetailOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryItemOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __param(4, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map