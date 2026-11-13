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
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocumentTypeService } from '../application/document-type.service';
import { CreateDocumentTypeDto, UpdateDocumentTypeDto } from '../application/dto/document-type.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('document-types')
export class DocumentTypeController {
	constructor(private readonly docTypeService: DocumentTypeService) {}

	/**
	 * Catálogo General Oficial de Tipos de Documentos (SRI Ecuador).
	 * Es general para todo el sistema, filtrable únicamente por estado activo o tipo de aplicación.
	 */
	@Get()
	list(
		@Query('type') typeQuery: string,
		@Query('active') activeQuery: string,
	) {
		const onlyActive = activeQuery === 'true' || activeQuery === '1';
		return this.docTypeService.list(typeQuery, onlyActive);
	}

	@Get(':id')
	get(@Param('id', ParseIntPipe) id: number) {
		return this.docTypeService.get(id);
	}

	@Post()
	create(@Body() dto: CreateDocumentTypeDto) {
		return this.docTypeService.create(dto);
	}

	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateDocumentTypeDto,
	) {
		return this.docTypeService.update(id, dto);
	}

	@Patch(':id/toggle-status')
	toggleStatus(@Param('id', ParseIntPipe) id: number) {
		return this.docTypeService.toggleStatus(id);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.docTypeService.remove(id);
	}
}

