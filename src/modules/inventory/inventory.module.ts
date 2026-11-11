import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	InventoryCategoryOrmEntity,
	InventoryItemOrmEntity,
	InventoryServiceOrmEntity,
	InventorySubcontractOrmEntity,
	InventoryWarehouseOrmEntity,
} from './infrastructure/persistence/inventory.orm-entity';
import { InventoryService } from './application/inventory.service';
import { InventoryController } from './presentation/inventory.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			InventoryItemOrmEntity,
			InventoryServiceOrmEntity,
			InventorySubcontractOrmEntity,
			InventoryCategoryOrmEntity,
			InventoryWarehouseOrmEntity,
		]),
	],
	controllers: [InventoryController],
	providers: [InventoryService],
	exports: [InventoryService],
})
export class InventoryModule {}

