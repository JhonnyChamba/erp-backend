import { SubscriptionsModuleRepository } from "../../domain/repositories/subscriptions-module.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetSubscriptionsModuleUseCase {
  constructor(private readonly repository: SubscriptionsModuleRepository) {}

  async execute(id: number, subscriptionId: number) {
    return this.repository.findById(id, subscriptionId);
  }
}
