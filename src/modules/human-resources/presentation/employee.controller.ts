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
import { EmployeeService } from '../application/employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './../application/dto/employee.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('hr/employees')
export class EmployeeController {
	constructor(private readonly employeeService: EmployeeService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Get()
	list(
		@Query('companyId') companyIdQuery: string,
		@Query('branchId') branchIdQuery: string,
		@Query('categoryId') categoryIdQuery: string,
		@Query('acceptsAppointments') acceptsAppointmentsQuery: string,
		@Query('status') statusQuery: string,
		@Query('search') searchQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const branchId = branchIdQuery ? Number(branchIdQuery) : undefined;
		const categoryId = categoryIdQuery ? Number(categoryIdQuery) : undefined;
		const acceptsAppointments =
			acceptsAppointmentsQuery !== undefined && acceptsAppointmentsQuery !== ''
				? acceptsAppointmentsQuery === 'true' || acceptsAppointmentsQuery === '1'
				: undefined;

		return this.employeeService.list(companyId, {
			branchId,
			categoryId,
			acceptsAppointments,
			status: statusQuery,
			search: searchQuery,
		});
	}

	@Get(':id')
	getById(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.employeeService.getById(Number(id), companyId);
	}

	@Post()
	create(@Body() dto: CreateEmployeeDto, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.employeeService.create(companyId, dto);
	}

	@Patch(':id')
	update(
		@Param('id') id: number,
		@Body() dto: UpdateEmployeeDto,
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.employeeService.update(Number(id), companyId, dto);
	}

	@Patch(':id/toggle-status')
	toggleStatus(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.employeeService.toggleStatus(Number(id), companyId);
	}

	@Delete(':id')
	remove(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.employeeService.remove(Number(id), companyId);
	}
}

