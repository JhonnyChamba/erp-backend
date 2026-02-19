import { CreateSubscriptionsModuleUseCase } from "./application/use-cases/create-subscriptions-module.use-case";
import { UpdateSubscriptionsModuleUseCase } from "./application/use-cases/update-subscriptions-module.use-case";
import { SubscriptionsModuleRepositoryImpl } from "./infrastructure/repositories/subscriptions-module.repository.impl";
import { ListSubscriptionsModuleUseCase } from "./application/use-cases/list-subscriptions-module.use-case";
import { SubscriptionsModuleOrmEntity } from "./infrastructure/persistence/subscriptions-module.orm-entity";
import { GetSubscriptionsModuleUseCase } from "./application/use-cases/get-subscriptions-module.use-case";
import { SubscriptionsModuleRepository } from "./domain/repositories/subscriptions-module.repository";
import { SubscriptionsModuleController } from "./presentation/subscriptions-module.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { ModuleModule } from "../module/module.module";

@Module({
	imports: [ModuleModule, TypeOrmModule.forFeature([SubscriptionsModuleOrmEntity])],
	controllers: [SubscriptionsModuleController],
	providers: [
		CreateSubscriptionsModuleUseCase,
		ListSubscriptionsModuleUseCase,
		GetSubscriptionsModuleUseCase,
		UpdateSubscriptionsModuleUseCase,
		{
			provide: SubscriptionsModuleRepository,
			useClass: SubscriptionsModuleRepositoryImpl,
		},
	],
})

export class SubscriptionsModuleModule { }