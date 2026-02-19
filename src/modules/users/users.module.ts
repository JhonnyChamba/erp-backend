import { FindUserByEmailUseCase } from "./application/use-cases/login-get-users.use-case";
import { UsersRepositoryImpl } from "./infrastructure/repositories/users.repository.impl";
import { CreateUsersUseCase } from "./application/use-cases/create-users.use-case";
import { UpdateUsersUseCase } from "./application/use-cases/update-users.use-case";
import { ListUsersUseCase } from "./application/use-cases/list-users.use-case";
import { UsersOrmEntity } from "./infrastructure/persistence/users.orm-entity";
import { GetUsersUseCase } from "./application/use-cases/get-users.use-case";
import { UsersRepository } from "./domain/repositories/users.repository";
import { UsersController } from "./presentation/users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { PasswordModule } from "src/common/password/password.module";

@Module({
	imports: [PasswordModule, TypeOrmModule.forFeature([UsersOrmEntity])],
	controllers: [UsersController],
	providers: [
		CreateUsersUseCase,
		ListUsersUseCase,
		GetUsersUseCase,
		UpdateUsersUseCase,
		FindUserByEmailUseCase,
		{
			provide: UsersRepository,
			useClass: UsersRepositoryImpl,
		},
	],
	exports: [
		FindUserByEmailUseCase, // 👈 ESTO ES LO QUE FALTA
		CreateUsersUseCase,     // si lo usas en AuthController
	],
})

export class UsersModule { }