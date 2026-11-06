import { CreateRolesTemplatesUseCase } from "../application/use-cases/create-roles-templates.use-case";
import { UpdateRolesTemplatesUseCase } from "../application/use-cases/update-roles-templates.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListRolesTemplatesUseCase } from "../application/use-cases/list-roles-templates.use-case";
import { GetRolesTemplatesUseCase } from "../application/use-cases/get-roles-templates.use-case";
import { CreateRolesTemplatesDto } from "../application/dto/create-roles-templates.dto";
import { UpdateRolesTemplatesDto } from "../application/dto/update-roles-templates.dto";
import { ListRolesTemplatesDto } from "../application/dto/list-roles-templates.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('rolesTemplates')
export class RolesTemplatesController {
	constructor(
		private readonly createUseCase: CreateRolesTemplatesUseCase,
		private readonly listUseCase: ListRolesTemplatesUseCase,
		private readonly getUseCase: GetRolesTemplatesUseCase,
		private readonly updateUseCase: UpdateRolesTemplatesUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateRolesTemplatesDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListRolesTemplatesDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id));
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdateRolesTemplatesDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), dto);
	}
}