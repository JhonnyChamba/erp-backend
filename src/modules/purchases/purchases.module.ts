import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrmEntity, PurchaseDetailOrmEntity } from './infrastructure/persistence/purchase.orm-entity';
import { PurchasesService } from './application/purchases.service';
import { PurchasesController } from './presentation/purchases.controller';
import { CompanyOrmEntity } from '../company/infrastructure/persistence/company.orm-entity';
import { InventoryWarehouseOrmEntity } from '../inventory/infrastructure/persistence/inventory.orm-entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			PurchaseOrmEntity,
			PurchaseDetailOrmEntity,
			CompanyOrmEntity,
			InventoryWarehouseOrmEntity,
		]),
		InventoryModule,
	],
	controllers: [PurchasesController],
	providers: [PurchasesService],
	exports: [PurchasesService],
})
export class PurchasesModule {}
