import { PurchasesService } from '../application/purchases.service';
import { CreatePurchaseDto } from '../application/dto/create-purchase.dto';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    private resolveCompanyId;
    create(dto: CreatePurchaseDto, req: any): Promise<import("../infrastructure/persistence/purchase.orm-entity").PurchaseOrmEntity>;
    findAll(companyIdQuery: string, warehouseIdQuery: string, statusQuery: string, qQuery: string, req: any): Promise<import("../infrastructure/persistence/purchase.orm-entity").PurchaseOrmEntity[]>;
    findOne(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/purchase.orm-entity").PurchaseOrmEntity>;
    cancelPatch(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/purchase.orm-entity").PurchaseOrmEntity>;
    cancelPost(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/purchase.orm-entity").PurchaseOrmEntity>;
}
