import { TaxService } from '../application/tax.service';
import { CreateTaxDto, UpdateTaxDto } from '../application/dto/tax.dto';
export declare class TaxController {
    private readonly taxService;
    constructor(taxService: TaxService);
    private resolveCompanyId;
    list(companyIdQuery: string, activeQuery: string, req: any): Promise<import("../infrastructure/persistence/tax.orm-entity").TaxOrmEntity[]>;
    get(id: number, req: any): Promise<import("../infrastructure/persistence/tax.orm-entity").TaxOrmEntity>;
    create(dto: CreateTaxDto, req: any): Promise<import("../infrastructure/persistence/tax.orm-entity").TaxOrmEntity>;
    update(id: number, dto: UpdateTaxDto, req: any): Promise<import("../infrastructure/persistence/tax.orm-entity").TaxOrmEntity>;
    toggleStatus(id: number, req: any): Promise<import("../infrastructure/persistence/tax.orm-entity").TaxOrmEntity>;
    remove(id: number, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
