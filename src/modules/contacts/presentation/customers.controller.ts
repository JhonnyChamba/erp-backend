import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { ContactsService } from '../application/contacts.service';
import { CustomerDto } from '../application/dto/contacts.dto';

// La empresa la valida CompanyAccessGuard (pertenencia del usuario) y queda en req.companyId.
@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('customers')
export class CustomersController {
	constructor(private readonly contactsService: ContactsService) {}

	@Get()
	list(@Req() req: any) {
		return this.contactsService.list('customer', req.companyId);
	}

	@Get(':id')
	get(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.get('customer', id, req.companyId);
	}

	@Post()
	create(@Body() dto: CustomerDto, @Req() req: any) {
		return this.contactsService.create('customer', dto, req.companyId, req.user?.user_id);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: CustomerDto, @Req() req: any) {
		return this.contactsService.update('customer', id, dto, req.companyId);
	}

	@Patch(':id/toggle-status')
	toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.toggleStatus('customer', id, req.companyId);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.remove('customer', id, req.companyId);
	}
}
