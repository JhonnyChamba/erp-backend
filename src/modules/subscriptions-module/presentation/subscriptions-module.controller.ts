import { CreateSubscriptionsModuleUseCase } from "../application/use-cases/create-subscriptions-module.use-case";
import { UpdateSubscriptionsModuleUseCase } from "../application/use-cases/update-subscriptions-module.use-case";
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ListSubscriptionsModuleUseCase } from "../application/use-cases/list-subscriptions-module.use-case";
import { GetSubscriptionsModuleUseCase } from "../application/use-cases/get-subscriptions-module.use-case";
import { CreateSubscriptionsModuleDto } from "../application/dto/create-subscriptions-module.dto";
import { UpdateSubscriptionsModuleDto } from "../application/dto/update-subscriptions-module.dto";
import { ListSubscriptionsModuleDto } from "../application/dto/list-subscriptions-module.dto";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller('subscriptionsModule')
export class SubscriptionsModuleController {

	constructor(
		private readonly createUseCase: CreateSubscriptionsModuleUseCase,
		private readonly listUseCase: ListSubscriptionsModuleUseCase,
		private readonly getUseCase: GetSubscriptionsModuleUseCase,
		private readonly updateUseCase: UpdateSubscriptionsModuleUseCase,
	) { }

	@Post()
	create(@Body() dto: CreateSubscriptionsModuleDto, @Req() req: any) {
		return this.createUseCase.execute(dto, req.user);
	}

	@Get()
	list(@Query() query: ListSubscriptionsModuleDto, @Req() req: any) {
		return this.listUseCase.execute(query, req.user);
	}

	@Get(':id')
	get(@Param('id') id: number, @Req() req: any) {
		return this.getUseCase.execute(Number(id), req.subscriptionId);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() dto: UpdateSubscriptionsModuleDto, @Req() req: any) {
		return this.updateUseCase.execute(Number(id), req.subscriptionId, dto);
	}
}
