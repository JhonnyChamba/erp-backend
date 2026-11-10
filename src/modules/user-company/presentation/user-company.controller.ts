import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CreateUserCompanyUseCase } from "../application/use-cases/create-user-company.use-case";
import { UpdateUserCompanyUseCase } from "../application/use-cases/update-user-company.use-case";
import { ListUserCompanyUseCase } from "../application/use-cases/list-user-company.use-case";
import { GetUserCompanyUseCase } from "../application/use-cases/get-user-company.use-case";
import { CreateUserCompanyDto } from "../application/dto/create-user-company.dto";
import { UpdateUserCompanyDto } from "../application/dto/update-user-company.dto";
import { ListUserCompanyDto } from "../application/dto/list-user-company.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('userCompany')
export class UserCompanyController {
	constructor(
		private readonly createUseCase: CreateUserCompanyUseCase,
		private readonly listUseCase: ListUserCompanyUseCase,
		private readonly getUseCase: GetUserCompanyUseCase,
		private readonly updateUseCase: UpdateUserCompanyUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateUserCompanyDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get('companies')
	list(@Query() query: ListUserCompanyDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		const userId = req.user?.user_id;
		return this.getUseCase.execute(Number(id), userId);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdateUserCompanyDto, @Req() req: any) {
		const userId = req.user?.user_id;
		return this.updateUseCase.execute(Number(id), userId, dto);
	}
}
