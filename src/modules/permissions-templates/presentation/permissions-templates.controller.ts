import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreatePermissionsTemplatesUseCase } from "../application/use-cases/create-permissions-templates.use-case";
import { UpdatePermissionsTemplatesUseCase } from "../application/use-cases/update-permissions-templates.use-case";
import { ListPermissionsTemplatesUseCase } from "../application/use-cases/list-permissions-templates.use-case";
import { GetPermissionsTemplatesUseCase } from "../application/use-cases/get-permissions-templates.use-case";
import { CreatePermissionsTemplatesDto } from "../application/dto/create-permissions-templates.dto";
import { UpdatePermissionsTemplatesDto } from "../application/dto/update-permissions-templates.dto";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListPermissionsTemplatesDto } from "../application/dto/list-permissions-templates.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('permissionsTemplates')
export class PermissionsTemplatesController {
	constructor(
		private readonly createUseCase: CreatePermissionsTemplatesUseCase,
		private readonly listUseCase: ListPermissionsTemplatesUseCase,
		private readonly getUseCase: GetPermissionsTemplatesUseCase,
		private readonly updateUseCase: UpdatePermissionsTemplatesUseCase,
	) { }

	@Post()
	create(@Body() dto: CreatePermissionsTemplatesDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListPermissionsTemplatesDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id));
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdatePermissionsTemplatesDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), dto);
	}
}