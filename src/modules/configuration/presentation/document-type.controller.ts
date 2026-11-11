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
import { DocumentTypeService } from '../application/document-type.service';
import { CreateDocumentTypeDto, UpdateDocumentTypeDto } from '../application/dto/document-type.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('document-types')
export class DocumentTypeController {
	constructor(private readonly docTypeService: DocumentTypeService) {}

	private resolveCompanyId(req: any, explicitId?: number): number {
		const headerVal = req?.headers?.['x-company-id'];
		const candidate = explicitId || Number(headerVal) || Number(req?.companyId) || Number(req?.user?.company_id) || 1;
		return !Number.isNaN(candidate) && candidate > 0 ? candidate : 1;
	}

	@Get()
	list(
		@Query('companyId') companyIdQuery: string,
		@Query('type') typeQuery: string,
		@Query('active') activeQuery: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery ? Number(companyIdQuery) : undefined);
		const onlyActive = activeQuery === 'true' || activeQuery === '1';
		return this.docTypeService.list(companyId, typeQuery, onlyActive);
	}

	@Get(':id')
	get(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.docTypeService.get(id, companyId);
	}

	@Post()
	create(@Body() dto: CreateDocumentTypeDto, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.docTypeService.create(companyId, dto);
	}

	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateDocumentTypeDto,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(req);
		return this.docTypeService.update(id, companyId, dto);
	}

	@Patch(':id/toggle-status')
	toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.docTypeService.toggleStatus(id, companyId);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		const companyId = this.resolveCompanyId(req);
		return this.docTypeService.remove(id, companyId);
	}
}

