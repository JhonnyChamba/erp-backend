import { AccessControlService } from "src/auth/access-control.service";
import { ForbiddenException } from "@nestjs/common";
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreateCompanyUseCase } from "../application/use-cases/create-company.use-case";
import { UpdateCompanyUseCase } from "../application/use-cases/update-company.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListCompanyUseCase } from "../application/use-cases/list-company.use-case";
import { GetCompanyUseCase } from "../application/use-cases/get-company.use-case";
import { CreateCompanyDto } from "../application/dto/create-company.dto";
import { UpdateCompanyDto } from "../application/dto/update-company.dto";
import { ListCompanyDto } from "../application/dto/list-company.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('company')
export class CompanyController {

	constructor(
		private readonly createUseCase: CreateCompanyUseCase,
		private readonly listUseCase: ListCompanyUseCase,
		private readonly getUseCase: GetCompanyUseCase,
		private readonly updateUseCase: UpdateCompanyUseCase,
		private readonly accessControlService: AccessControlService,
	) { }

	private async assertCompanyAccess(user: any, companyId: number) {
		if (!(await this.accessControlService.canAccessCompany(user, companyId))) {
			throw new ForbiddenException('No tienes acceso a la empresa indicada');
		}
	}

	@Post('register')
	create(@Body() dto: CreateCompanyDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListCompanyDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	async get(@Param('id') id: number, @Req() req: any) {
		await this.assertCompanyAccess(req.user, Number(id));
		return this.getUseCase.execute(Number(id));
	}

	@Patch(':id')
	async update(@Param('id') id: number, @Body() dto: UpdateCompanyDto, @Req() req: any) {
		await this.assertCompanyAccess(req.user, Number(id));
		return this.updateUseCase.execute(Number(id), dto);
	}
}
