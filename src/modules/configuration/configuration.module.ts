import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxOrmEntity } from './infrastructure/persistence/tax.orm-entity';
import { DocumentTypeOrmEntity } from './infrastructure/persistence/document-type.orm-entity';
import { TaxService } from './application/tax.service';
import { DocumentTypeService } from './application/document-type.service';
import { TaxController } from './presentation/tax.controller';
import { DocumentTypeController } from './presentation/document-type.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([TaxOrmEntity, DocumentTypeOrmEntity]),
	],
	controllers: [TaxController, DocumentTypeController],
	providers: [TaxService, DocumentTypeService],
	exports: [TaxService, DocumentTypeService],
})
export class ConfigurationModule {}

