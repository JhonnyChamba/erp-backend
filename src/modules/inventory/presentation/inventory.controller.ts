import { CreateInventoryItemDto, UpdateInventoryItemDto, CreateInventoryServiceDto, UpdateInventoryServiceDto, CreateInventorySubcontractDto, UpdateInventorySubcontractDto, CreateInventoryCategoryDto, UpdateInventoryCategoryDto, CreateInventoryWarehouseDto, UpdateInventoryWarehouseDto, CreateUnifiedItemDto, UpdateUnifiedItemDto, CreateInventoryTransferDto, CreateInventoryAdjustmentDto } from '../application/dto/inventory.dto';
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { InventoryService } from '../application/inventory.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('inventory')
export class InventoryController {
	constructor(private readonly inventoryService: InventoryService) { }

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

	// ============================================================
	// 4. CATEGORÍAS DE INVENTARIO (/inventory/categories)
	// ============================================================
	@Get('categories')
	listCategories(
		@Query('companyId') queryCompanyId: string,
		@Query('type') type: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.listCategories(companyId, type);
	}

	@Post('categories')
	createCategory(
		@Body() dto: CreateInventoryCategoryDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.createCategory(dto, companyId, req.user?.user_id);
	}

	@Patch('categories/:id')
	updateCategory(
		@Param('id') id: string,
		@Body() dto: UpdateInventoryCategoryDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.updateCategory(Number(id), companyId, dto);
	}

	@Delete('categories/:id')
	deleteCategory(
		@Param('id') id: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.deleteCategory(Number(id), companyId);
	}

	// ============================================================
	// 5. BODEGAS / ALMACENES (/inventory/warehouses)
	// ============================================================
	@Get('warehouses')
	listWarehouses(
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.listWarehouses(companyId);
	}

	@Post('warehouses')
	createWarehouse(
		@Body() dto: CreateInventoryWarehouseDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.createWarehouse(dto, companyId, req.user?.user_id);
	}

	@Patch('warehouses/:id')
	updateWarehouse(
		@Param('id') id: string,
		@Body() dto: UpdateInventoryWarehouseDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.updateWarehouse(Number(id), companyId, dto);
	}

	@Delete('warehouses/:id')
	deleteWarehouse(
		@Param('id') id: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.deleteWarehouse(Number(id), companyId);
	}

	// ============================================================
	// 6. CATÁLOGO ÚNICO (/inventory/unified-items)
	// ============================================================
	@Get('unified-items')
	listUnifiedItems(
		@Query('companyId') queryCompanyId: string,
		@Query('type') type: string,
		@Query('categoryId') categoryId: string,
		@Query('search') search: string,
		@Query('status') status: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		const parsedStatus = status === 'true' ? true : status === 'false' ? false : undefined;
		return this.inventoryService.listUnifiedItems(companyId, {
			type,
			categoryId: categoryId ? Number(categoryId) : undefined,
			search,
			status: parsedStatus,
		});
	}

	@Get('unified-items/:id')
	getUnifiedItem(
		@Param('id') id: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.getUnifiedItemById(Number(id), companyId);
	}

	@Post('unified-items')
	createUnifiedItem(
		@Body() dto: CreateUnifiedItemDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		dto.companyId = companyId;
		return this.inventoryService.createUnifiedItem(dto, req.user?.user_id);
	}

	@Patch('unified-items/:id')
	updateUnifiedItem(
		@Param('id') id: string,
		@Body() dto: UpdateUnifiedItemDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		return this.inventoryService.updateUnifiedItem(Number(id), companyId, dto);
	}

	@Delete('unified-items/:id')
	deleteUnifiedItem(
		@Param('id') id: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.deleteUnifiedItem(Number(id), companyId);
	}

	// ============================================================
	// 7. MOTOR CENTRAL: SALDOS, KARDEX, AJUSTES Y TRANSFERENCIAS
	// ============================================================
	@Get('stock/:productId')
	getStock(
		@Param('productId') productId: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.getStock(companyId, Number(productId));
	}

	@Get('stock/warehouse/:warehouseId')
	getStockByWarehouse(
		@Param('warehouseId') warehouseId: string,
		@Query('productId') productId: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.getStockByWarehouse(
			companyId,
			Number(warehouseId),
			productId ? Number(productId) : undefined,
		);
	}

	@Get('kardex')
	getAllKardex(
		@Query('productId') productId: string,
		@Query('warehouseId') warehouseId: string,
		@Query('fromDate') fromDate: string,
		@Query('toDate') toDate: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.getKardex(
			companyId,
			productId ? Number(productId) : undefined,
			warehouseId ? Number(warehouseId) : undefined,
			fromDate,
			toDate,
		);
	}

	@Get('kardex/:productId')
	getKardex(
		@Param('productId') productId: string,
		@Query('warehouseId') warehouseId: string,
		@Query('fromDate') fromDate: string,
		@Query('toDate') toDate: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.getKardex(
			companyId,
			Number(productId),
			warehouseId ? Number(warehouseId) : undefined,
			fromDate,
			toDate,
		);
	}

	@Get('reconcile')
	reconcileStock(
		@Query('warehouseId') warehouseId: string,
		@Query('productId') productId: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.reconcileStock(companyId, Number(warehouseId), Number(productId));
	}

	@Post('transfers')
	createTransfer(
		@Body() dto: CreateInventoryTransferDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		dto.companyId = companyId;
		dto.created_user_id = req.user?.user_id;
		return this.inventoryService.registerTransfer(dto);
	}

	@Post('adjustments')
	createAdjustment(
		@Body() dto: CreateInventoryAdjustmentDto,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(undefined, headerCompanyId, dto.companyId, req);
		dto.companyId = companyId;
		dto.created_user_id = req.user?.user_id;
		return this.inventoryService.createAdjustment(dto);
	}

	@Post('movements/:id/reverse')
	reverseMovement(
		@Param('id') id: string,
		@Body('reason') reason: string,
		@Query('companyId') queryCompanyId: string,
		@Headers('x-company-id') headerCompanyId: string,
		@Req() req: any,
	) {
		const companyId = this.resolveCompanyId(queryCompanyId, headerCompanyId, undefined, req);
		return this.inventoryService.reverseMovement(Number(id), companyId, reason);
	}
}

