import { CreatePlansModulesUseCase } from "./application/use-cases/create-plans-module.use-case";
import { UpdatePlansModulesUseCase } from "./application/use-cases/update-plans-module.use-case";
import { PlansModulesRepositoryImpl } from "./infrastructure/repositories/plans-module.repository.impl";
import { ListPlansModulesUseCase } from "./application/use-cases/list-plans-module.use-case";
import { PlansModulesOrmEntity } from "./infrastructure/persistence/plans-module.orm-entity";
import { GetPlansModulesUseCase } from "./application/use-cases/get-plans-module.use-case";
import { PlansModulesRepository } from "./domain/repositories/plans-module.repository";
import { PlansModulesController } from "./presentation/plans-module.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { ModuleModule } from "../module/module.module";

@Module({
	imports: [ModuleModule, TypeOrmModule.forFeature([PlansModulesOrmEntity])],
	controllers: [PlansModulesController],
	providers: [
		CreatePlansModulesUseCase,
		ListPlansModulesUseCase,
		GetPlansModulesUseCase,
		UpdatePlansModulesUseCase,
		{
			provide: PlansModulesRepository,
			useClass: PlansModulesRepositoryImpl,
		},
	],
})

export class PlansModulesModule { }