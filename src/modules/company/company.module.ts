import { CompanyRepositoryImpl } from "./infrastructure/repositories/company.repository.impl";
import { CreateCompanyUseCase } from "./application/use-cases/create-company.use-case";
import { UpdateCompanyUseCase } from "./application/use-cases/update-company.use-case";
import { ListCompanyUseCase } from "./application/use-cases/list-company.use-case";
import { CompanyOrmEntity } from "./infrastructure/persistence/company.orm-entity";
import { GetCompanyUseCase } from "./application/use-cases/get-company.use-case";
import { CompanyRepository } from "./domain/repositories/company.repository";
import { CompanyController } from "./presentation/company.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([CompanyOrmEntity])],
	controllers: [CompanyController],
	providers: [
		CreateCompanyUseCase,
		ListCompanyUseCase,
		GetCompanyUseCase,
		UpdateCompanyUseCase,
		{
			provide: CompanyRepository,
			useClass: CompanyRepositoryImpl,
		},
	],
})

export class CompanyModule { }