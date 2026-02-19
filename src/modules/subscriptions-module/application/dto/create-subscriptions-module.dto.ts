import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionsModuleDto {
	@IsNumber()
	@IsNotEmpty()
	subscriptionId: number;

	@IsNumber()
	@IsNotEmpty()
	moduleId: number;
}