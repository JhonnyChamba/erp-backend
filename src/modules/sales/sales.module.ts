import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceOrmEntity, InvoiceDetailOrmEntity } from './infrastructure/persistence/invoice.orm-entity';
import { CreditNoteOrmEntity, CreditNoteDetailOrmEntity } from './infrastructure/persistence/credit-note.orm-entity';
import { EmissionPointOrmEntity, EmissionPointSequenceOrmEntity } from './infrastructure/persistence/emission-point.orm-entity';
import { BranchCompanyOrmEntity } from '../branch-company/infrastructure/persistence/branch-company.orm-entity';
import { InvoiceService } from './application/invoice.service';
import { CreditNoteService } from './application/credit-note.service';
import { EmissionPointService } from './application/emission-point.service';
import { InvoiceController } from './presentation/invoice.controller';
import { CreditNoteController } from './presentation/credit-note.controller';
import { EmissionPointController } from './presentation/emission-point.controller';
import { InventoryItemOrmEntity } from '../inventory/infrastructure/persistence/inventory.orm-entity';
import { CompanyOrmEntity } from '../company/infrastructure/persistence/company.orm-entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			InvoiceOrmEntity,
			InvoiceDetailOrmEntity,
			CreditNoteOrmEntity,
			CreditNoteDetailOrmEntity,
			EmissionPointOrmEntity,
			EmissionPointSequenceOrmEntity,
			BranchCompanyOrmEntity,
			InventoryItemOrmEntity,
			CompanyOrmEntity,
		]),
		InventoryModule,
	],
	controllers: [InvoiceController, CreditNoteController, EmissionPointController],
	providers: [InvoiceService, CreditNoteService, EmissionPointService],
	exports: [InvoiceService, CreditNoteService, EmissionPointService],
})
export class SalesModule {}

