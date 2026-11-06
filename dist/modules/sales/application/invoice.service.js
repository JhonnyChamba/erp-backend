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
const invoice_orm_entity_1 = require("../infrastructure/persistence/invoice.orm-entity");
const inventory_orm_entity_1 = require("../../inventory/infrastructure/persistence/inventory.orm-entity");
const company_orm_entity_1 = require("../../company/infrastructure/persistence/company.orm-entity");
let InvoiceService = class InvoiceService {
    invoiceRepo;
    detailRepo;
    inventoryItemRepo;
    companyRepo;
    constructor(invoiceRepo, detailRepo, inventoryItemRepo, companyRepo) {
        this.invoiceRepo = invoiceRepo;
        this.detailRepo = detailRepo;
        this.inventoryItemRepo = inventoryItemRepo;
        this.companyRepo = companyRepo;
    }
    generateSRIAccessKey(issueDate, ruc, establishment, emissionPoint, sequential, environment = '1') {
        const cleanDate = issueDate.replace(/-/g, '');
        const parts = cleanDate.match(/^(\d{4})(\d{2})(\d{2})$/);
        const ddmmyyyy = parts ? `${parts[3]}${parts[2]}${parts[1]}` : cleanDate;
        const docType = '01';
        const paddedRuc = ruc.padEnd(13, '0').slice(0, 13);
        const serie = `${establishment.padStart(3, '0')}${emissionPoint.padStart(3, '0')}`;
        const seq = sequential.padStart(9, '0');
        const numericCode = '12345678';
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
    async getNextSequential(companyId, establishment, emissionPoint) {
        const last = await this.invoiceRepo.findOne({
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
        const establishment = (dto.establishment || '001').padStart(3, '0');
        const emissionPoint = (dto.emission_point || '001').padStart(3, '0');
        const sequential = await this.getNextSequential(companyId, establishment, emissionPoint);
        const invoiceNumber = `${establishment}-${emissionPoint}-${sequential}`;
        const issueDate = dto.issue_date || new Date().toISOString().slice(0, 10);
        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        const companyRuc = company?.ruc || '1790012345001';
        const accessKey = this.generateSRIAccessKey(issueDate, companyRuc, establishment, emissionPoint, sequential);
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
            const detail = this.detailRepo.create({
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
                const item = await this.inventoryItemRepo.findOne({ where: { id: d.item_id, company: { id: companyId } } });
                if (item) {
                    item.stock_current = Math.max(0, Number(item.stock_current || 0) - qty);
                    await this.inventoryItemRepo.save(item);
                }
            }
        }
        const total = Number((subtotalTaxable + subtotalZero + taxTotal).toFixed(2));
        const invoice = this.invoiceRepo.create({
            company: { id: companyId },
            establishment,
            emission_point: emissionPoint,
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
        const saved = await this.invoiceRepo.save(invoice);
        return saved;
    }
    async findAll(companyId) {
        return this.invoiceRepo.find({
            where: { company: { id: companyId }, deleted: false },
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
        invoice.status = 'CANCELED';
        return this.invoiceRepo.save(invoice);
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_orm_entity_1.InvoiceOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_orm_entity_1.InvoiceDetailOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(inventory_orm_entity_1.InventoryItemOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map