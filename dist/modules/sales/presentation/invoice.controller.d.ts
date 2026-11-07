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
    sign(id: number, companyIdQuery: string, req: any): Promise<{
        id: number;
        sign_status: string;
        file_name: string;
    }>;
    xml(id: number, companyIdQuery: string, req: any): Promise<{
        file_name: string;
        xml: string;
    }>;
}
