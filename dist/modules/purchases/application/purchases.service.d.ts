import { Repository, DataSource } from 'typeorm';
import { PurchaseOrmEntity, PurchaseDetailOrmEntity } from '../infrastructure/persistence/purchase.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { InventoryWarehouseOrmEntity } from 'src/modules/inventory/infrastructure/persistence/inventory.orm-entity';
import { InventoryService } from 'src/modules/inventory/application/inventory.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class PurchasesService {
    private readonly purchaseRepo;
    private readonly purchaseDetailRepo;
    private readonly companyRepo;
    private readonly warehouseRepo;
    private readonly inventoryService;
    private readonly dataSource;
    constructor(purchaseRepo: Repository<PurchaseOrmEntity>, purchaseDetailRepo: Repository<PurchaseDetailOrmEntity>, companyRepo: Repository<CompanyOrmEntity>, warehouseRepo: Repository<InventoryWarehouseOrmEntity>, inventoryService: InventoryService, dataSource: DataSource);
    createPurchase(companyId: number, dto: CreatePurchaseDto, userId?: number): Promise<PurchaseOrmEntity>;
    listPurchases(companyId: number, query?: {
        q?: string;
        warehouseId?: number;
        status?: string;
    }): Promise<PurchaseOrmEntity[]>;
    getPurchaseById(id: number, companyId: number): Promise<PurchaseOrmEntity>;
    cancelPurchase(id: number, companyId: number, userId?: number): Promise<PurchaseOrmEntity>;
}
