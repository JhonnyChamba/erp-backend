import { BranchCompanyRepositoryImpl } from "./infrastructure/repositories/branch.repository.impl";
import { CreateBranchCompanyUseCase } from "./application/use-cases/create-branch-company.use-case";
import { UpdateBranchCompanyUseCase } from "./application/use-cases/update-branch-company.use-case";
import { ListBranchCompanyUseCase } from "./application/use-cases/list-branch-company.use-case";
import { BranchCompanyOrmEntity } from "./infrastructure/persistence/branch-company.orm-entity";
import { SetMatrixBranchCompanyUseCase } from "./application/use-cases/set-matrix-branch-company.use-case";
import { DeleteBranchCompanyUseCase } from "./application/use-cases/delete-branch-company.use-case";
import { GetBranchCompanyUseCase } from "./application/use-cases/get-branch-company.use-case";
import { BranchCompanyRepository } from "./domain/repositories/branch-company.repository";
import { BranchCompanyController } from "./presentation/branch-company.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([BranchCompanyOrmEntity])],
	controllers: [BranchCompanyController],
	providers: [
		CreateBranchCompanyUseCase,
		ListBranchCompanyUseCase,
		GetBranchCompanyUseCase,
		UpdateBranchCompanyUseCase,
		DeleteBranchCompanyUseCase,
		SetMatrixBranchCompanyUseCase,
		{
			provide: BranchCompanyRepository,
			useClass: BranchCompanyRepositoryImpl,
		},
	],
})

export class BranchCompanyModule { }