import { InvoiceService } from '../application/invoice.service';
import { CreateInvoiceDto } from '../application/dto/create-invoice.dto';
export declare class InvoiceController {
    private readonly invoiceService;
    constructor(invoiceService: InvoiceService);
    private resolveCompanyId;
    create(dto: CreateInvoiceDto, req: any): Promise<import("../infrastructure/persistence/invoice.orm-entity").InvoiceOrmEntity>;
    findAll(companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/invoice.orm-entity").InvoiceOrmEntity[]>;
    findOne(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/invoice.orm-entity").InvoiceOrmEntity>;
    cancel(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/invoice.orm-entity").InvoiceOrmEntity>;
}
