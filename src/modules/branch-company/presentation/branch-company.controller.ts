import { CreateBranchCompanyUseCase } from "../application/use-cases/create-branch-company.use-case";
import { UpdateBranchCompanyUseCase } from "../application/use-cases/update-branch-company.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListBranchCompanyUseCase } from "../application/use-cases/list-branch-company.use-case";
import { GetBranchCompanyUseCase } from "../application/use-cases/get-branch-company.use-case";
import { CreateBranchCompanyDto } from "../application/dto/create-branch-company.dto";
import { UpdateBranchCompanyDto } from "../application/dto/update-branch-company.dto";
import { ListBranchCompanyDto } from "../application/dto/list-branch-company.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('branchCompany')
export class BranchCompanyController {

	constructor(
		private readonly createUseCase: CreateBranchCompanyUseCase,
		private readonly listUseCase: ListBranchCompanyUseCase,
		private readonly getUseCase: GetBranchCompanyUseCase,
		private readonly updateUseCase: UpdateBranchCompanyUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateBranchCompanyDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListBranchCompanyDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(
		@Param('id') id: number,
		@Query('companyId') queryCompanyId: number,
		@Req() req: any,
	) {
		const companyId = req.companyId || queryCompanyId || req.headers['x-company-id'];
		return this.getUseCase.execute(Number(id), Number(companyId));
	}

	@Patch(':id')
	update(
		@Param('id') id: number,
		@Body() dto: UpdateBranchCompanyDto,
		@Req() req: any,
	) {
		const companyId = req.companyId || (dto as any)?.companyId || req.headers['x-company-id'];
		return this.updateUseCase.execute(Number(id), Number(companyId), dto);
	}
}
