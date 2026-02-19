import { SubscriptionsRepository } from "../../domain/repositories/subscriptions.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateSubscriptionsUseCase {
  constructor(private readonly repository: SubscriptionsRepository) { }

  async execute(id: number, companyId: number, dto: any) {
    const subscriptions = await this.repository.findById(id, companyId);
    if (!subscriptions) throw new Error('Subscriptions not found');

    subscriptions.begin_date = dto.begin_date ?? subscriptions.begin_date;
    subscriptions.end_date = dto.end_date ?? subscriptions.end_date;
    subscriptions.enabled = dto.enabled ?? subscriptions.enabled;

    return this.repository.update(subscriptions);
  }
}
