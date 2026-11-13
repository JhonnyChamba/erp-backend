import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentOrmEntity } from './infrastructure/persistence/appointment.orm-entity';
import { AppointmentItemOrmEntity } from './infrastructure/persistence/appointment-item.orm-entity';
import { EmployeeScheduleOrmEntity } from './infrastructure/persistence/employee-schedule.orm-entity';
import { EmployeeOrmEntity } from 'src/modules/human-resources/infrastructure/persistence/employee.orm-entity';
import { CustomerOrmEntity } from 'src/modules/contacts/infrastructure/persistence/contacts.orm-entity';
import { AppointmentsService } from './application/appointments.service';
import { AppointmentsController } from './presentation/appointments.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			AppointmentOrmEntity,
			AppointmentItemOrmEntity,
			EmployeeScheduleOrmEntity,
			EmployeeOrmEntity,
			CustomerOrmEntity,
		]),
	],
	controllers: [AppointmentsController],
	providers: [AppointmentsService],
	exports: [AppointmentsService],
})
export class AppointmentsModule {}

