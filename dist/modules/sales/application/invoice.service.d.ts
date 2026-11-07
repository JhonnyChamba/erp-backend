import { Repository } from 'typeorm';
import { InvoiceOrmEntity, InvoiceDetailOrmEntity } from '../infrastructure/persistence/invoice.orm-entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InventoryItemOrmEntity } from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare class InvoiceService {
    private readonly invoiceRepo;
    private readonly detailRepo;
    private readonly inventoryItemRepo;
    private readonly companyRepo;
    constructor(invoiceRepo: Repository<InvoiceOrmEntity>, detailRepo: Repository<InvoiceDetailOrmEntity>, inventoryItemRepo: Repository<InventoryItemOrmEntity>, companyRepo: Repository<CompanyOrmEntity>);
    private generateSRIAccessKey;
    private getNextSequential;
    create(dto: CreateInvoiceDto, companyId: number, userId?: number): Promise<InvoiceOrmEntity>;
    findAll(companyId: number): Promise<InvoiceOrmEntity[]>;
    findOne(id: number, companyId: number): Promise<InvoiceOrmEntity>;
    cancel(id: number, companyId: number): Promise<InvoiceOrmEntity>;
    sign(id: number, companyId: number): Promise<{
        id: number;
        sign_status: string;
        file_name: string;
    }>;
    getSignedXml(id: number, companyId: number): Promise<{
        file_name: string;
        xml: string;
    }>;
}
