import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { ContactsService } from '../application/contacts.service';
import { SellerDto } from '../application/dto/contacts.dto';

// La empresa la valida CompanyAccessGuard (pertenencia del usuario) y queda en req.companyId.
@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('sellers')
export class SellersController {
	constructor(private readonly contactsService: ContactsService) {}

	@Get()
	list(@Req() req: any) {
		return this.contactsService.list('seller', req.companyId);
	}

	@Get(':id')
	get(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.get('seller', id, req.companyId);
	}

	@Post()
	create(@Body() dto: SellerDto, @Req() req: any) {
		return this.contactsService.create('seller', dto, req.companyId, req.user?.user_id);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: SellerDto, @Req() req: any) {
		return this.contactsService.update('seller', id, dto, req.companyId);
	}

	@Patch(':id/toggle-status')
	toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.toggleStatus('seller', id, req.companyId);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.remove('seller', id, req.companyId);
	}
}
