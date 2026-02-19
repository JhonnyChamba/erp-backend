import { CreatesubModulesUseCase } from "./application/use-cases/create-sub-module.use-case";
import { UpdatesubModulesUseCase } from "./application/use-cases/update-sub-module.use-case";
import { subModulesRepositoryImpl } from "./infrastructure/repositories/sub-module.repository.impl";
import { ListsubModulesUseCase } from "./application/use-cases/list-sub-module.use-case";
import { subModulesOrmEntity } from "./infrastructure/persistence/sub-module.orm-entity";
import { GetsubModulesUseCase } from "./application/use-cases/get-sub-module.use-case";
import { subModulesRepository } from "./domain/repositories/sub-module.repository";
import { subModulesController } from "./presentation/sub-module.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { ModuleModule } from "../module/module.module";

@Module({
	imports: [ModuleModule, TypeOrmModule.forFeature([subModulesOrmEntity])],
	controllers: [subModulesController],
	providers: [
		CreatesubModulesUseCase,
		ListsubModulesUseCase,
		GetsubModulesUseCase,
		UpdatesubModulesUseCase,
		{
			provide: subModulesRepository,
			useClass: subModulesRepositoryImpl,
		},
	],
})

export class subModulesModule { }