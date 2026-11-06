import { SubscriptionsRepositoryImpl } from "./infrastructure/repositories/subscriptions.repository.impl";
import { CreateSubscriptionsUseCase } from "./application/use-cases/create-subscriptions.use-case";
import { UpdateSubscriptionsUseCase } from "./application/use-cases/update-subscriptions.use-case";
import { ListSubscriptionsUseCase } from "./application/use-cases/list-subscriptions.use-case";
import { SubscriptionsOrmEntity } from "./infrastructure/persistence/subscriptions.orm-entity";
import { SubscriptionsModuleOrmEntity } from "../subscriptions-module/infrastructure/persistence/subscriptions-module.orm-entity";
import { GetSubscriptionsUseCase } from "./application/use-cases/get-subscriptions.use-case";
import { SubscriptionsRepository } from "./domain/repositories/subscriptions.repository";
import { SubscriptionsController } from "./presentation/subscriptions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
	imports: [TypeOrmModule.forFeature([SubscriptionsOrmEntity, SubscriptionsModuleOrmEntity])],
	controllers: [SubscriptionsController],
	providers: [
		CreateSubscriptionsUseCase,
		ListSubscriptionsUseCase,
		GetSubscriptionsUseCase,
		UpdateSubscriptionsUseCase,
		{
			provide: SubscriptionsRepository,
			useClass: SubscriptionsRepositoryImpl,
		},
	],
})

export class SubscriptionsModule { }