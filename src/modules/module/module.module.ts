import { ModuleRepositoryImpl } from "./infrastructure/repositories/module.repository.impl";
import { CreateModuleUseCase } from "./application/use-cases/create-module.use-case";
import { UpdateModuleUseCase } from "./application/use-cases/update-module.use-case";
import { ListModuleUseCase } from "./application/use-cases/list-module.use-case";
import { ModuleOrmEntity } from "./infrastructure/persistence/module.orm-entity";
import { GetModuleUseCase } from "./application/use-cases/get-module.use-case";
import { ModuleRepository } from "./domain/repositories/module.repository";
import { ModuleController } from "./presentation/module.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([ModuleOrmEntity])],
	controllers: [ModuleController],
	providers: [
		CreateModuleUseCase,
		ListModuleUseCase,
		GetModuleUseCase,
		UpdateModuleUseCase,
		{
			provide: ModuleRepository,
			useClass: ModuleRepositoryImpl,
		},
	],
	exports: [
		ModuleRepository,          // ✅ exportas el token
		CreateModuleUseCase,       // opcional si lo necesitas
		ListModuleUseCase,
		GetModuleUseCase,
	],
})

export class ModuleModule { }