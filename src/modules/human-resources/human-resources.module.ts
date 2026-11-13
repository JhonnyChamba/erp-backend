import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeCategoryOrmEntity } from './infrastructure/persistence/employee-category.orm-entity';
import { EmployeeOrmEntity } from './infrastructure/persistence/employee.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { PasswordModule } from 'src/common/password/password.module';
import { EmployeeCategoryService } from './application/employee-category.service';
import { EmployeeService } from './application/employee.service';
import { EmployeeCategoryController } from './presentation/employee-category.controller';
import { EmployeeController } from './presentation/employee.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			EmployeeCategoryOrmEntity,
			EmployeeOrmEntity,
			UsersOrmEntity,
		]),
		PasswordModule,
	],
	controllers: [
		EmployeeCategoryController,
		EmployeeController,
	],
	providers: [
		EmployeeCategoryService,
		EmployeeService,
	],
	exports: [
		EmployeeCategoryService,
		EmployeeService,
	],
})
export class HumanResourcesModule {}

