import { PlansRepositoryImpl } from "./infrastructure/repositories/plans.repository.impl";
import { CreatePlansUseCase } from "./application/use-cases/create-plans.use-case";
import { UpdatePlansUseCase } from "./application/use-cases/update-plans.use-case";
import { ListPlansUseCase } from "./application/use-cases/list-plans.use-case";
import { PlansOrmEntity } from "./infrastructure/persistence/plans.orm-entity";
import { GetPlansUseCase } from "./application/use-cases/get-plans.use-case";
import { PlansRepository } from "./domain/repositories/plans.repository";
import { PlansController } from "./presentation/plans.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([PlansOrmEntity])],
	controllers: [PlansController],
	providers: [
		CreatePlansUseCase,
		ListPlansUseCase,
		GetPlansUseCase,
		UpdatePlansUseCase,
		{
			provide: PlansRepository,
			useClass: PlansRepositoryImpl,
		},
	],
})

export class PlansModule { }