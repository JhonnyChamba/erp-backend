import { InvoiceOrmEntity } from '../infrastructure/persistence/invoice.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare function buildInvoiceXml(inv: InvoiceOrmEntity, company: CompanyOrmEntity): string;
