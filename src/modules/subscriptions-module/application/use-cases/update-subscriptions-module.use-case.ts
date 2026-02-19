import { SubscriptionsModuleRepository } from "../../domain/repositories/subscriptions-module.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateSubscriptionsModuleUseCase {
  constructor(private readonly repository: SubscriptionsModuleRepository) { }

  async execute(id: number, subscriptionId: number, dto: any) {
    const subModule = await this.repository.findById(id, subscriptionId);
    if (!subModule) throw new Error('SubscriptionsModule not found');

    return this.repository.update(subModule);
  }
}
