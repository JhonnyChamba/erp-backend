import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceOrmEntity, InvoiceDetailOrmEntity } from './infrastructure/persistence/invoice.orm-entity';
import { InvoiceService } from './application/invoice.service';
import { InvoiceController } from './presentation/invoice.controller';
import { InventoryItemOrmEntity } from '../inventory/infrastructure/persistence/inventory.orm-entity';
import { CompanyOrmEntity } from '../company/infrastructure/persistence/company.orm-entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			InvoiceOrmEntity,
			InvoiceDetailOrmEntity,
			InventoryItemOrmEntity,
			CompanyOrmEntity,
		]),
	],
	controllers: [InvoiceController],
	providers: [InvoiceService],
	exports: [InvoiceService],
})
export class SalesModule {}
