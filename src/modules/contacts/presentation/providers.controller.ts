import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { ContactsService } from '../application/contacts.service';
import { ProviderDto } from '../application/dto/contacts.dto';

// La empresa la valida CompanyAccessGuard (pertenencia del usuario) y queda en req.companyId.
@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('providers')
export class ProvidersController {
	constructor(private readonly contactsService: ContactsService) {}

	@Get()
	list(@Req() req: any) {
		return this.contactsService.list('provider', req.companyId);
	}

	@Get(':id')
	get(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.get('provider', id, req.companyId);
	}

	@Post()
	create(@Body() dto: ProviderDto, @Req() req: any) {
		return this.contactsService.create('provider', dto, req.companyId, req.user?.user_id);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: ProviderDto, @Req() req: any) {
		return this.contactsService.update('provider', id, dto, req.companyId);
	}

	@Patch(':id/toggle-status')
	toggleStatus(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.toggleStatus('provider', id, req.companyId);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
		return this.contactsService.remove('provider', id, req.companyId);
	}
}
