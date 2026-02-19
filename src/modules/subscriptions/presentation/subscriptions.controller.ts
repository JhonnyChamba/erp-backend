import { CreateSubscriptionsUseCase } from "../application/use-cases/create-subscriptions.use-case";
import { UpdateSubscriptionsUseCase } from "../application/use-cases/update-subscriptions.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListSubscriptionsUseCase } from "../application/use-cases/list-subscriptions.use-case";
import { GetSubscriptionsUseCase } from "../application/use-cases/get-subscriptions.use-case";
import { CreateSubscriptionsDto } from "../application/dto/create-subscriptions.dto";
import { UpdateSubscriptionsDto } from "../application/dto/update-subscriptions.dto";
import { ListSubscriptionsDto } from "../application/dto/list-subscriptions.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('subscriptions')
export class SubscriptionsController {

	constructor(
		private readonly createUseCase: CreateSubscriptionsUseCase,
		private readonly listUseCase: ListSubscriptionsUseCase,
		private readonly getUseCase: GetSubscriptionsUseCase,
		private readonly updateUseCase: UpdateSubscriptionsUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateSubscriptionsDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListSubscriptionsDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id), req.companyId);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdateSubscriptionsDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), req.companyId, dto);
	}
}
