import { DataSource, Repository } from 'typeorm';
import { InvoiceOrmEntity, InvoiceDetailOrmEntity } from '../infrastructure/persistence/invoice.orm-entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InventoryItemOrmEntity } from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { SriMessage } from './sri-client';
export declare class InvoiceService {
    private readonly invoiceRepo;
    private readonly detailRepo;
    private readonly inventoryItemRepo;
    private readonly companyRepo;
    private readonly dataSource;
    constructor(invoiceRepo: Repository<InvoiceOrmEntity>, detailRepo: Repository<InvoiceDetailOrmEntity>, inventoryItemRepo: Repository<InventoryItemOrmEntity>, companyRepo: Repository<CompanyOrmEntity>, dataSource: DataSource);
    private generateSRIAccessKey;
    private getNextSequential;
    create(dto: CreateInvoiceDto, companyId: number, userId?: number): Promise<InvoiceOrmEntity>;
    private createInTransaction;
    findAll(companyId: number, branchId?: number): Promise<InvoiceOrmEntity[]>;
    findOne(id: number, companyId: number): Promise<InvoiceOrmEntity>;
    cancel(id: number, companyId: number): Promise<InvoiceOrmEntity>;
    sign(id: number, companyId: number): Promise<{
        id: number;
        sign_status: string;
        file_name: string;
    }>;
    sendToSri(id: number, companyId: number): Promise<{
        id: number;
        sri_status: string;
        sri_authorization_number: string;
        sri_authorization_date: string;
        sri_messages: SriMessage[];
    }>;
    checkSriAuthorization(id: number, companyId: number): Promise<{
        id: number;
        sri_status: string;
        sri_authorization_number: string;
        sri_authorization_date: string;
        sri_messages: SriMessage[];
    }>;
    private getSriEnvironment;
    private buildSriResult;
    getSignedXml(id: number, companyId: number): Promise<{
        file_name: string;
        xml: string;
    }>;
}
