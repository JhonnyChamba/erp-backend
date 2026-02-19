import { RolesRepositoryImpl } from "./infrastructure/repositories/roles.repository.impl";
import { CreateRolesUseCase } from "./application/use-cases/create-roles.use-case";
import { UpdateRolesUseCase } from "./application/use-cases/update-roles.use-case";
import { ListRolesUseCase } from "./application/use-cases/list-roles.use-case";
import { RolesOrmEntity } from "./infrastructure/persistence/roles.orm-entity";
import { GetRolesUseCase } from "./application/use-cases/get-roles.use-case";
import { RolesRepository } from "./domain/repositories/roles.repository";
import { RolesController } from "./presentation/roles.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([RolesOrmEntity])],
	controllers: [RolesController],
	providers: [
		CreateRolesUseCase,
		ListRolesUseCase,
		GetRolesUseCase,
		UpdateRolesUseCase,
		{
			provide: RolesRepository,
			useClass: RolesRepositoryImpl,
		},
	],
})

export class RolesModule { }