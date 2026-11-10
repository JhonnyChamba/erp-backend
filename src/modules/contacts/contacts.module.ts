import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrmEntity, ProviderOrmEntity, SellerOrmEntity } from './infrastructure/persistence/contacts.orm-entity';
import { ContactsService } from './application/contacts.service';
import { CustomersController } from './presentation/customers.controller';
import { ProvidersController } from './presentation/providers.controller';
import { SellersController } from './presentation/sellers.controller';

@Module({
	imports: [TypeOrmModule.forFeature([CustomerOrmEntity, ProviderOrmEntity, SellerOrmEntity])],
	controllers: [CustomersController, ProvidersController, SellersController],
	providers: [ContactsService],
	exports: [ContactsService],
})
export class ContactsModule {}
