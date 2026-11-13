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
import { EmployeeCategoryService } from '../application/employee-category.service';
import { CreateEmployeeCategoryDto, UpdateEmployeeCategoryDto } from '../application/dto/employee-category.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('hr/categories')
export class EmployeeCategoryController {
	constructor(private readonly categoryService: EmployeeCategoryService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Get()
	list(@Query('companyId') companyIdQuery: string, @Query('active') activeQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const activeOnly = activeQuery === 'true' || activeQuery === '1';
		return this.categoryService.list(companyId, activeOnly);
	}

	@Get(':id')
	getById(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.categoryService.getById(Number(id), companyId);
	}

	@Post()
	create(@Body() dto: CreateEmployeeCategoryDto, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.categoryService.create(companyId, dto);
	}

	@Patch(':id')
	update(
		@Param('id') id: number,
		@Body() dto: UpdateEmployeeCategoryDto,
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.categoryService.update(Number(id), companyId, dto);
	}

	@Patch(':id/toggle-status')
	toggleStatus(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.categoryService.toggleStatus(Number(id), companyId);
	}

	@Delete(':id')
	remove(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.categoryService.remove(Number(id), companyId);
	}
}

