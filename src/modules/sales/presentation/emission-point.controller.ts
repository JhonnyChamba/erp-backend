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
import { EmissionPointService } from '../application/emission-point.service';
import { CreateEmissionPointDto, UpdateEmissionPointDto, UpdateSequenceDto } from '../application/dto/emission-point.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('sales/emission-points')
export class EmissionPointController {
	constructor(private readonly emissionPointService: EmissionPointService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Get()
	findAll(@Query('branchId') branchIdQuery: string, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const branchId = branchIdQuery ? Number(branchIdQuery) : undefined;
		return this.emissionPointService.listEmissionPoints(companyId, branchId);
	}

	@Get('next-sequential')
	getNextSequential(
		@Query('branchId') branchIdQuery: string,
		@Query('emissionPointId') emissionPointIdQuery: string,
		@Query('serie') serieQuery: string,
		@Query('documentType') documentTypeQuery: string,
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const branchId = Number(branchIdQuery);
		const emissionPointId = emissionPointIdQuery ? Number(emissionPointIdQuery) : undefined;
		const documentType = documentTypeQuery || 'FACTURAS';
		return this.emissionPointService.getNextSequential(companyId, branchId, emissionPointId, serieQuery, documentType);
	}

	@Get(':id')
	findOne(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.emissionPointService.getEmissionPointById(Number(id), companyId);
	}

	@Post()
	create(@Body() dto: CreateEmissionPointDto, @Req() req: any) {
		const explicit = (dto as any)?.companyId || (dto as any)?.company_id;
		const companyId = this.resolveCompanyId(req, explicit);
		return this.emissionPointService.createEmissionPoint(companyId, dto, req.user?.user_id);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdateEmissionPointDto, @Req() req: any) {
		const explicit = (dto as any)?.companyId || (dto as any)?.company_id;
		const companyId = this.resolveCompanyId(req, explicit);
		return this.emissionPointService.updateEmissionPoint(Number(id), companyId, dto);
	}

	@Delete(':id')
	delete(@Param('id') id: number, @Query('companyId') companyIdQuery: string, @Req() req: any) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		return this.emissionPointService.deleteEmissionPoint(Number(id), companyId);
	}

	@Patch('sequences/:sequenceId')
	updateSequence(@Param('sequenceId') sequenceId: number, @Body() dto: UpdateSequenceDto, @Req() req: any) {
		const explicit = (dto as any)?.companyId || (dto as any)?.company_id;
		const companyId = this.resolveCompanyId(req, explicit);
		return this.emissionPointService.updateSequenceCorrelative(Number(sequenceId), companyId, dto);
	}
}
