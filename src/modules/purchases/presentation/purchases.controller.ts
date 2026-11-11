import {
	Controller,
	Get,
	Post,
	Patch,
	Body,
	Param,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { PurchasesService } from '../application/purchases.service';
import { CreatePurchaseDto } from '../application/dto/create-purchase.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('purchases')
export class PurchasesController {
	constructor(private readonly purchasesService: PurchasesService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Post()
	create(@Body() dto: CreatePurchaseDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.purchasesService.createPurchase(companyId, dto, req.user?.user_id);
	}

	@Get()
	findAll(
		@Query('companyId') companyIdQuery: string,
		@Query('warehouseId') warehouseIdQuery: string,
		@Query('status') statusQuery: string,
		@Query('q') qQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.purchasesService.listPurchases(companyId, {
			warehouseId: warehouseIdQuery ? Number(warehouseIdQuery) : undefined,
			status: statusQuery,
			q: qQuery,
		});
	}

	@Get(':id')
	findOne(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.purchasesService.getPurchaseById(Number(id), companyId);
	}

	@Patch(':id/cancel')
	cancelPatch(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.purchasesService.cancelPurchase(Number(id), companyId, req.user?.user_id);
	}

	@Post(':id/cancel')
	cancelPost(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.purchasesService.cancelPurchase(Number(id), companyId, req.user?.user_id);
	}
}

