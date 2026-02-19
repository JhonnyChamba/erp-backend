import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateSubscriptionsModuleDto {
	@IsNumber()
	@IsNotEmpty()
	subscriptionId: number;

	@IsNumber()
	@IsNotEmpty()
	moduleId: number;
}