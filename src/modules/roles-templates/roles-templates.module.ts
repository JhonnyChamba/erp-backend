import { RolesTemplatesRepositoryImpl } from "./infrastructure/repositories/roles-templates.repository.impl";
import { CreateRolesTemplatesUseCase } from "./application/use-cases/create-roles-templates.use-case";
import { UpdateRolesTemplatesUseCase } from "./application/use-cases/update-roles-templates.use-case";
import { ListRolesTemplatesUseCase } from "./application/use-cases/list-roles-templates.use-case";
import { RolesTemplatesOrmEntity } from "./infrastructure/persistence/roles-templates.orm-entity";
import { GetRolesTemplatesUseCase } from "./application/use-cases/get-roles-templates.use-case";
import { RolesTemplatesRepository } from "./domain/repositories/roles-templates.repository";
import { RolesTemplatesController } from "./presentation/roles-templates.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([RolesTemplatesOrmEntity])],
	controllers: [RolesTemplatesController],
	providers: [
		CreateRolesTemplatesUseCase,
		ListRolesTemplatesUseCase,
		GetRolesTemplatesUseCase,
		UpdateRolesTemplatesUseCase,
		{
			provide: RolesTemplatesRepository,
			useClass: RolesTemplatesRepositoryImpl,
		},
	],
})

export class RolesTemplatesModule { }