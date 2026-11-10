import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { Controller, Get, Post, Body, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoiceService } from '../application/invoice.service';
import { CreateInvoiceDto } from '../application/dto/create-invoice.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('sales/invoices')
export class InvoiceController {
	constructor(private readonly invoiceService: InvoiceService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Post()
	create(@Body() dto: CreateInvoiceDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, dto.companyId);
		return this.invoiceService.create(dto, companyId, req.user?.user_id);
	}

	@Get()
	findAll(@Query('companyId') companyIdQuery: string, @Query('branchId') branchIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const branchId = Number(branchIdQuery);
		return this.invoiceService.findAll(companyId, Number.isInteger(branchId) && branchId > 0 ? branchId : undefined);
	}

	@Get(':id')
	findOne(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.invoiceService.findOne(Number(id), companyId);
	}

	@Patch(':id/cancel')
	cancel(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.invoiceService.cancel(Number(id), companyId);
	}

	@Post(':id/sign')
	sign(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.invoiceService.sign(Number(id), companyId);
	}

	@Post(':id/send-sri')
	sendToSri(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.invoiceService.sendToSri(Number(id), companyId);
	}

	@Post(':id/check-sri')
	checkSri(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.invoiceService.checkSriAuthorization(Number(id), companyId);
	}

	@Get(':id/xml')
	xml(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.invoiceService.getSignedXml(Number(id), companyId);
	}
}

