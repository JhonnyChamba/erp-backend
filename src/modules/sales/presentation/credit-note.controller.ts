import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, Header, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreditNoteService } from '../application/credit-note.service';
import { CreateCreditNoteDto } from '../application/dto/create-credit-note.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('sales/credit-notes')
export class CreditNoteController {
	constructor(private readonly creditNoteService: CreditNoteService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Post()
	create(@Body() dto: CreateCreditNoteDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.creditNoteService.create(dto, companyId, req.user?.user_id);
	}

	@Get()
	findAll(
		@Query('companyId') companyIdQuery: string,
		@Query('branchId') branchIdQuery: string,
		@Query('invoiceId') invoiceIdQuery: string,
		@Query('search') search: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const branchId = Number(branchIdQuery);
		const invoiceId = Number(invoiceIdQuery);

		return this.creditNoteService.list(companyId, {
			branchId: Number.isInteger(branchId) && branchId > 0 ? branchId : undefined,
			invoiceId: Number.isInteger(invoiceId) && invoiceId > 0 ? invoiceId : undefined,
			search,
		});
	}

	@Get('next-sequential')
	getNextSequential(
		@Query('branchId') branchIdQuery: string,
		@Query('emissionPoint') emissionPointQuery: string,
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const branchId = Number(branchIdQuery) || 1;
		const emissionPoint = emissionPointQuery || '001';
		return this.creditNoteService.getNextSequentialPreview(companyId, branchId, emissionPoint);
	}

	@Get(':id')
	findOne(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.creditNoteService.findById(Number(id), companyId);
	}

	@Post(':id/send-sri')
	sendToSri(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.creditNoteService.sendToSri(Number(id), companyId);
	}

	@Get(':id/xml')
	async downloadXml(
		@Param('id') id: number,
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
		@Res() res: Response,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const { file_name, xml } = await this.creditNoteService.getSignedXml(Number(id), companyId);
		res.setHeader('Content-Type', 'application/xml');
		res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
		return res.send(xml);
	}
}
