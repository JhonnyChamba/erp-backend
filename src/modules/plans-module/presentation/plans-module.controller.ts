import { CreatePlansModulesUseCase } from "../application/use-cases/create-plans-module.use-case";
import { UpdatePlansModulesUseCase } from "../application/use-cases/update-plans-module.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListPlansModulesUseCase } from "../application/use-cases/list-plans-module.use-case";
import { GetPlansModulesUseCase } from "../application/use-cases/get-plans-module.use-case";
import { CreatePlansModulesDto } from "../application/dto/create-plans-module.dto";
import { UpdatePlansModulesDto } from "../application/dto/update-plans-module.dto";
import { ListPlansModulesDto } from "../application/dto/list-plans-module.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('plansModules')
export class PlansModulesController {

	constructor(
		private readonly createUseCase: CreatePlansModulesUseCase,
		private readonly listUseCase: ListPlansModulesUseCase,
		private readonly getUseCase: GetPlansModulesUseCase,
		private readonly updateUseCase: UpdatePlansModulesUseCase,
	) { }

	@Post()
	create(@Body() dto: CreatePlansModulesDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListPlansModulesDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id), req.planId);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdatePlansModulesDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), req.planId, dto);
	}
}
