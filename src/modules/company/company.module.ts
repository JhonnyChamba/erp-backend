import { CompanyRepositoryImpl } from "./infrastructure/repositories/company.repository.impl";
import { CreateCompanyUseCase } from "./application/use-cases/create-company.use-case";
import { UpdateCompanyUseCase } from "./application/use-cases/update-company.use-case";
import { ListCompanyUseCase } from "./application/use-cases/list-company.use-case";
import { CompanyOrmEntity } from "./infrastructure/persistence/company.orm-entity";
import { RolesOrmEntity, RoleModuleOrmEntity } from "../roles/infrastructure/persistence/roles.orm-entity";
import { SubscriptionsOrmEntity } from "../subscriptions/infrastructure/persistence/subscriptions.orm-entity";
import { CustomerOrmEntity, SellerOrmEntity } from "../contacts/infrastructure/persistence/contacts.orm-entity";
import { InventoryWarehouseOrmEntity } from "../inventory/infrastructure/persistence/inventory.orm-entity";
import { BranchCompanyOrmEntity } from "../branch-company/infrastructure/persistence/branch-company.orm-entity";
import { EmissionPointOrmEntity, EmissionPointSequenceOrmEntity } from "../sales/infrastructure/persistence/emission-point.orm-entity";
import { TaxOrmEntity } from "../configuration/infrastructure/persistence/tax.orm-entity";
import { DocumentTypeOrmEntity } from "../configuration/infrastructure/persistence/document-type.orm-entity";
import { UserCompanyOrmEntity } from "../user-company/infrastructure/persistence/user-company.orm-entity";
import { GetCompanyUseCase } from "./application/use-cases/get-company.use-case";
import { InspectCertUseCase } from "./application/use-cases/inspect-cert.use-case";
import { CompanyRepository } from "./domain/repositories/company.repository";
import { CompanyController } from "./presentation/company.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			CompanyOrmEntity,
			RolesOrmEntity,
			RoleModuleOrmEntity,
			SubscriptionsOrmEntity,
			CustomerOrmEntity,
			SellerOrmEntity,
			InventoryWarehouseOrmEntity,
			BranchCompanyOrmEntity,
			EmissionPointOrmEntity,
			EmissionPointSequenceOrmEntity,
			TaxOrmEntity,
			DocumentTypeOrmEntity,
			UserCompanyOrmEntity,
		]),
	],
	controllers: [CompanyController],
	providers: [
		CreateCompanyUseCase,
		ListCompanyUseCase,
		GetCompanyUseCase,
		UpdateCompanyUseCase,
		InspectCertUseCase,
		{
			provide: CompanyRepository,
			useClass: CompanyRepositoryImpl,
		},
	],
})

export class CompanyModule { }