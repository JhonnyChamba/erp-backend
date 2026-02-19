import { PlansRepository } from "../../domain/repositories/plans.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetPlansUseCase {
  constructor(private readonly repository: PlansRepository) { }

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
