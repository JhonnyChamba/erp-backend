import { UserCompanyRepositoryImpl } from "./infrastructure/repositories/user-company.repository.impl";
import { CreateUserCompanyUseCase } from "./application/use-cases/create-user-company.use-case";
import { UpdateUserCompanyUseCase } from "./application/use-cases/update-user-company.use-case";
import { ListUserCompanyUseCase } from "./application/use-cases/list-user-company.use-case";
import { UserCompanyOrmEntity } from "./infrastructure/persistence/user-company.orm-entity";
import { CompanyOrmEntity } from "../company/infrastructure/persistence/company.orm-entity";
import { GetUserCompanyUseCase } from "./application/use-cases/get-user-company.use-case";
import { UserCompanyRepository } from "./domain/repositories/user-company.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { UserCompanyController } from "./presentation/user-company.controller";

@Module({
	imports: [
		TypeOrmModule.forFeature([UserCompanyOrmEntity, CompanyOrmEntity]),
	],
	controllers: [UserCompanyController],
	providers: [
		CreateUserCompanyUseCase,
		ListUserCompanyUseCase,
		GetUserCompanyUseCase,
		UpdateUserCompanyUseCase,
		{
			provide: UserCompanyRepository,
			useClass: UserCompanyRepositoryImpl,
		},
	],
})

export class UserCompanyModule { }
