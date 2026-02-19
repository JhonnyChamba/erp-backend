import { CreateRolesUseCase } from "../application/use-cases/create-roles.use-case";
import { UpdateRolesUseCase } from "../application/use-cases/update-roles.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListRolesUseCase } from "../application/use-cases/list-roles.use-case";
import { GetRolesUseCase } from "../application/use-cases/get-roles.use-case";
import { CreateRolesDto } from "../application/dto/create-roles.dto";
import { UpdateRolesDto } from "../application/dto/update-roles.dto";
import { ListRolesDto } from "../application/dto/list-roles.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
	constructor(
		private readonly createUseCase: CreateRolesUseCase,
		private readonly listUseCase: ListRolesUseCase,
		private readonly getUseCase: GetRolesUseCase,
		private readonly updateUseCase: UpdateRolesUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateRolesDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListRolesDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id), req.companyId);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdateRolesDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), req.companyId, dto);
	}
}