import { CreatesubModulesUseCase } from "../application/use-cases/create-sub-module.use-case";
import { UpdatesubModulesUseCase } from "../application/use-cases/update-sub-module.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListsubModulesUseCase } from "../application/use-cases/list-sub-module.use-case";
import { GetsubModulesUseCase } from "../application/use-cases/get-sub-module.use-case";
import { CreatesubModulesDto } from "../application/dto/create-sub-module.dto";
import { UpdatesubModulesDto } from "../application/dto/update-sub-module.dto";
import { ListsubModulesDto } from "../application/dto/list-sub-module.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('subModule')
export class subModulesController {

	constructor(
		private readonly createUseCase: CreatesubModulesUseCase,
		private readonly listUseCase: ListsubModulesUseCase,
		private readonly getUseCase: GetsubModulesUseCase,
		private readonly updateUseCase: UpdatesubModulesUseCase,
	) { }

	@Post()
	create(@Body() dto: CreatesubModulesDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListsubModulesDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id), req.moduleId);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdatesubModulesDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), req.moduleId, dto);
	}
}
