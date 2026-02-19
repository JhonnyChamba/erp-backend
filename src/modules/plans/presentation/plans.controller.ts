import { CreatePlansUseCase } from "../application/use-cases/create-plans.use-case";
import { UpdatePlansUseCase } from "../application/use-cases/update-plans.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListPlansUseCase } from "../application/use-cases/list-plans.use-case";
import { GetPlansUseCase } from "../application/use-cases/get-plans.use-case";
import { CreatePlansDto } from "../application/dto/create-plans.dto";
import { UpdatePlansDto } from "../application/dto/update-plans.dto";
import { ListPlansDto } from "../application/dto/list-plans.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('plans')
export class PlansController {

	constructor(
		private readonly createUseCase: CreatePlansUseCase,
		private readonly listUseCase: ListPlansUseCase,
		private readonly getUseCase: GetPlansUseCase,
		private readonly updateUseCase: UpdatePlansUseCase,
	) { }

	@Post('register')
	create(@Body() dto: CreatePlansDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListPlansDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id));
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdatePlansDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), dto);
	}
}
