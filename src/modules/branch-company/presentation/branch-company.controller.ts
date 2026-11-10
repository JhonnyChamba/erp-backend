import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreateBranchCompanyUseCase } from "../application/use-cases/create-branch-company.use-case";
import { UpdateBranchCompanyUseCase } from "../application/use-cases/update-branch-company.use-case";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { SetMatrixBranchCompanyUseCase } from "../application/use-cases/set-matrix-branch-company.use-case";
import { DeleteBranchCompanyUseCase } from "../application/use-cases/delete-branch-company.use-case";
import { ListBranchCompanyUseCase } from "../application/use-cases/list-branch-company.use-case";
import { GetBranchCompanyUseCase } from "../application/use-cases/get-branch-company.use-case";
import { CreateBranchCompanyDto } from "../application/dto/create-branch-company.dto";
import { UpdateBranchCompanyDto } from "../application/dto/update-branch-company.dto";
import { ListBranchCompanyDto } from "../application/dto/list-branch-company.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('branchCompany')
export class BranchCompanyController {

	constructor(
		private readonly createUseCase: CreateBranchCompanyUseCase,
		private readonly listUseCase: ListBranchCompanyUseCase,
		private readonly getUseCase: GetBranchCompanyUseCase,
		private readonly updateUseCase: UpdateBranchCompanyUseCase,
		private readonly deleteUseCase: DeleteBranchCompanyUseCase,
		private readonly setMatrixUseCase: SetMatrixBranchCompanyUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateBranchCompanyDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListBranchCompanyDto, @Req() req: any) {
		query.companyId = query.companyId ?? Number(req.companyId);
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

	/** Define la matriz de la empresa (la anterior deja de serlo). */
	@Patch(':id/set-matrix')
	setMatrix(@Param('id') id: number, @Req() req: any) {
		return this.setMatrixUseCase.execute(Number(id), Number(req.companyId));
	}

	@Delete(':id')
	remove(@Param('id') id: number, @Req() req: any) {
		return this.deleteUseCase.execute(Number(id), Number(req.companyId));
	}
}
