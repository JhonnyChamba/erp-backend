import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { CompanyOrmEntity } from '../company/infrastructure/persistence/company.orm-entity';
import { BranchCompanyOrmEntity } from '../branch-company/infrastructure/persistence/branch-company.orm-entity';
import { UsersOrmEntity } from '../users/infrastructure/persistence/users.orm-entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			CompanyOrmEntity,
			BranchCompanyOrmEntity,
			UsersOrmEntity,
		]),
	],
	controllers: [StorageController],
	providers: [StorageService],
	exports: [StorageService],
})
export class StorageModule {}
