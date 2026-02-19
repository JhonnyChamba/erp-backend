import { PermissionsTemplatesRepositoryImpl } from "./infrastructure/repositories/permissions-templates.repository.impl";
import { CreatePermissionsTemplatesUseCase } from "./application/use-cases/create-permissions-templates.use-case";
import { UpdatePermissionsTemplatesUseCase } from "./application/use-cases/update-permissions-templates.use-case";
import { ListPermissionsTemplatesUseCase } from "./application/use-cases/list-permissions-templates.use-case";
import { PermissionsTemplatesOrmEntity } from "./infrastructure/persistence/permissions-templates.orm-entity";
import { GetPermissionsTemplatesUseCase } from "./application/use-cases/get-permissions-templates.use-case";
import { PermissionsTemplatesRepository } from "./domain/repositories/permissions-templates.repository";
import { PermissionsTemplatesController } from "./presentation/permissions-templates.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([PermissionsTemplatesOrmEntity])],
	controllers: [PermissionsTemplatesController],
	providers: [
		CreatePermissionsTemplatesUseCase,
		ListPermissionsTemplatesUseCase,
		GetPermissionsTemplatesUseCase,
		UpdatePermissionsTemplatesUseCase,
		{
			provide: PermissionsTemplatesRepository,
			useClass: PermissionsTemplatesRepositoryImpl,
		},
	],
})

export class PermissionsTemplatesModule { }