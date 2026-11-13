import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { AppointmentsService } from '../application/appointments.service';
import {
	CreateAppointmentDto,
	UpdateAppointmentDto,
	UpdateAppointmentStatusDto,
	SaveEmployeeScheduleDto,
} from '../application/dto/appointment.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('appointments')
export class AppointmentsController {
	constructor(private readonly appointmentsService: AppointmentsService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Get()
	list(
		@Query('companyId') companyIdQuery: string,
		@Query('branchId') branchIdQuery: string,
		@Query('employeeId') employeeIdQuery: string,
		@Query('customerId') customerIdQuery: string,
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
		@Query('status') status: string,
		@Query('search') search: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.appointmentsService.list(companyId, {
			branchId: branchIdQuery ? Number(branchIdQuery) : undefined,
			employeeId: employeeIdQuery ? Number(employeeIdQuery) : undefined,
			customerId: customerIdQuery ? Number(customerIdQuery) : undefined,
			startDate,
			endDate,
			status,
			search,
		});
	}

	@Get('calendar')
	calendar(
		@Query('companyId') companyIdQuery: string,
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
		@Query('employeeId') employeeIdQuery: string,
		@Query('branchId') branchIdQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const today = new Date().toISOString().split('T')[0];
		return this.appointmentsService.getCalendarEvents(companyId, {
			startDate: startDate || today,
			endDate: endDate || today,
			employeeId: employeeIdQuery ? Number(employeeIdQuery) : undefined,
			branchId: branchIdQuery ? Number(branchIdQuery) : undefined,
		});
	}

	@Get('schedules')
	getSchedules(
		@Query('companyId') companyIdQuery: string,
		@Query('employeeId') employeeIdQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.appointmentsService.getEmployeeSchedules(
			companyId,
			employeeIdQuery ? Number(employeeIdQuery) : undefined,
		);
	}

	@Post('schedules')
	saveSchedules(@Body() dto: SaveEmployeeScheduleDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.appointmentsService.saveEmployeeSchedules(companyId, dto);
	}

	@Get(':id')
	getById(@Param('id') id: string, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.appointmentsService.getById(Number(id), companyId);
	}

	@Post()
	create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.appointmentsService.create(companyId, dto);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.appointmentsService.update(Number(id), companyId, dto);
	}

	@Patch(':id/status')
	changeStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.appointmentsService.changeStatus(Number(id), companyId, dto.status, dto.invoice_id);
	}

	@Delete(':id')
	delete(@Param('id') id: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.appointmentsService.delete(Number(id), companyId);
	}
}

