import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreateUsersUseCase } from "../application/use-cases/create-users.use-case";
import { UpdateUsersUseCase } from "../application/use-cases/update-users.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListUsersUseCase } from "../application/use-cases/list-users.use-case";
import { GetUsersUseCase } from "../application/use-cases/get-users.use-case";
import { CreateUsersDto } from "../application/dto/create-users.dto";
import { UpdateUsersDto } from "../application/dto/update-users.dto";
import { ListUsersDto } from "../application/dto/list-users.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('users')
export class UsersController {
	constructor(
		private readonly createUseCase: CreateUsersUseCase,
		private readonly listUseCase: ListUsersUseCase,
		private readonly getUseCase: GetUsersUseCase,
		private readonly updateUseCase: UpdateUsersUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateUsersDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListUsersDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user, req.companyId);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		// req.companyId: empresa ya validada por CompanyAccessGuard
		return this.getUseCase.execute(Number(id), req.companyId, req.user);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdateUsersDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), req.companyId, dto, req.user);
	}
}
