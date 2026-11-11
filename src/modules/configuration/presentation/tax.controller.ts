import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { TaxService } from '../application/tax.service';
import { CreateTaxDto, UpdateTaxDto } from '../application/dto/tax.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('taxes')
export class TaxController {
	constructor(private readonly taxService: TaxService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Get()
	list(
		@Query('companyId') companyIdQuery: string,
		@Query('active') activeQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const onlyActive = activeQuery === 'true' || activeQuery === '1';
		return this.taxService.list(companyId, onlyActive);
	}

	@Get(':id')
	get(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.taxService.get(id, companyId);
	}

	@Post()
	create(@Body() dto: CreateTaxDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.taxService.create(companyId, dto);
	}

	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateTaxDto,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req);
		return this.taxService.update(id, companyId, dto);
	}

	@Patch(':id/toggle-status')
	toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.taxService.toggleStatus(id, companyId);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.taxService.remove(id, companyId);
	}
}

