import { CreateModuleUseCase } from "../application/use-cases/create-module.use-case";
import { UpdateModuleUseCase } from "../application/use-cases/update-module.use-case";
import { ListModuleUseCase } from "../application/use-cases/list-module.use-case";
import { GetModuleUseCase } from "../application/use-cases/get-module.use-case";
import { CreateModuleDto } from "../application/dto/create-module.dto";
import { UpdateModuleDto } from "../application/dto/update-module.dto";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListModuleDto } from "../application/dto/list-module.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('module')
export class ModuleController {
	constructor(
		private readonly createUseCase: CreateModuleUseCase,
		private readonly listUseCase: ListModuleUseCase,
		private readonly getUseCase: GetModuleUseCase,
		private readonly updateUseCase: UpdateModuleUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateModuleDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListModuleDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id));
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdateModuleDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), dto);
	}
}