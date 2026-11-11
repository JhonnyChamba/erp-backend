import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceOrmEntity, InvoiceDetailOrmEntity } from './infrastructure/persistence/invoice.orm-entity';
import { EmissionPointOrmEntity, EmissionPointSequenceOrmEntity } from './infrastructure/persistence/emission-point.orm-entity';
import { BranchCompanyOrmEntity } from '../branch-company/infrastructure/persistence/branch-company.orm-entity';
import { InvoiceService } from './application/invoice.service';
import { EmissionPointService } from './application/emission-point.service';
import { InvoiceController } from './presentation/invoice.controller';
import { EmissionPointController } from './presentation/emission-point.controller';
import { InventoryItemOrmEntity } from '../inventory/infrastructure/persistence/inventory.orm-entity';
import { CompanyOrmEntity } from '../company/infrastructure/persistence/company.orm-entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			InvoiceOrmEntity,
			InvoiceDetailOrmEntity,
			EmissionPointOrmEntity,
			EmissionPointSequenceOrmEntity,
			BranchCompanyOrmEntity,
			InventoryItemOrmEntity,
			CompanyOrmEntity,
		]),
		InventoryModule,
	],
	controllers: [InvoiceController, EmissionPointController],
	providers: [InvoiceService, EmissionPointService],
	exports: [InvoiceService, EmissionPointService],
})
export class SalesModule {}
