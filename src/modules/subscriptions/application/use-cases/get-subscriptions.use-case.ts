import { SubscriptionsRepository } from "../../domain/repositories/subscriptions.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetSubscriptionsUseCase {
  constructor(private readonly repository: SubscriptionsRepository) {}

  async execute(id: number, companyId: number) {
    return this.repository.findById(id, companyId);
  }
}
