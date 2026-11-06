import {
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from '../application/inventory.service';
import {
	CreateInventoryItemDto,
	UpdateInventoryItemDto,
	CreateInventoryServiceDto,
	UpdateInventoryServiceDto,
	CreateInventorySubcontractDto,
	UpdateInventorySubcontractDto,
} from '../application/dto/inventory.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory')
export class InventoryController {
	constructor(private readonly inventoryService: InventoryService) {}

	private resolveCompanyId(queryCompanyId?: any, headerCompanyId?: any, bodyCompanyId?: any, req?: any): number {
		return Number(queryCompanyId || bodyCompanyId || headerCompanyId || req?.user?.company_id || 1);
	}

	// ============================================================
	// 1. ÍTEMS / ARTÍCULOS FÍSICOS (/inventory/items)
	// ============================================================
	@Get('items')
	listItems(
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.listItems(companyId);
	}

	@Post('items')
	createItem(
		@Body() dto: CreateInventoryItemDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.createItem(dto, companyId, req.user?.user_id);
	}

	@Patch('items/:id')
	updateItem(
		@Param('id') id: string,
		@Body() dto: UpdateInventoryItemDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.updateItem(Number(id), companyId, dto);
	}

	@Delete('items/:id')
	deleteItem(
		@Param('id') id: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.deleteItem(Number(id), companyId);
	}

	// ============================================================
	// 2. SERVICIOS PROPIOS (/inventory/services)
	// ============================================================
	@Get('services')
	listServices(
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.listServices(companyId);
	}

	@Post('services')
	createService(
		@Body() dto: CreateInventoryServiceDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.createService(dto, companyId, req.user?.user_id);
	}

	@Patch('services/:id')
	updateService(
		@Param('id') id: string,
		@Body() dto: UpdateInventoryServiceDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.updateService(Number(id), companyId, dto);
	}

	@Delete('services/:id')
	deleteService(
		@Param('id') id: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.deleteService(Number(id), companyId);
	}

	// ============================================================
	// 3. SUBCONTRATACIÓN / MANO DE OBRA (/inventory/subcontracts)
	// ============================================================
	@Get('subcontracts')
	listSubcontracts(
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.listSubcontracts(companyId);
	}

	@Post('subcontracts')
	createSubcontract(
		@Body() dto: CreateInventorySubcontractDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.createSubcontract(dto, companyId, req.user?.user_id);
	}

	@Patch('subcontracts/:id')
	updateSubcontract(
		@Param('id') id: string,
		@Body() dto: UpdateInventorySubcontractDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.updateSubcontract(Number(id), companyId, dto);
	}

	@Delete('subcontracts/:id')
	deleteSubcontract(
		@Param('id') id: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.deleteSubcontract(Number(id), companyId);
	}
}
