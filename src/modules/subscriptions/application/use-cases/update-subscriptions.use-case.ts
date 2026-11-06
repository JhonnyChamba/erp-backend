import { SubscriptionsRepository } from "../../domain/repositories/subscriptions.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UpdateSubscriptionsUseCase {
  constructor(private readonly repository: SubscriptionsRepository) { }

  async execute(id: number, companyId: number, dto: any) {
    const subscriptions = await this.repository.findById(id, companyId);
    if (!subscriptions) throw new Error('Subscriptions not found');

    subscriptions.planId = dto.planId ?? subscriptions.planId;
    subscriptions.begin_date = dto.begin_date ?? subscriptions.begin_date;
    subscriptions.end_date = dto.end_date ?? subscriptions.end_date;
    subscriptions.enabled = dto.enabled ?? subscriptions.enabled;
    if (dto.moduleIds !== undefined) {
      subscriptions.moduleIds = dto.moduleIds;
    }
    if (dto.subModuleIds !== undefined) {
      subscriptions.subModuleIds = dto.subModuleIds;
    }

    return this.repository.update(subscriptions);
  }
}
