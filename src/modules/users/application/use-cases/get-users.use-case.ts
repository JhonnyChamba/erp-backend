import { UsersRepository } from "../../domain/repositories/users.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly repository: UsersRepository) {}

  async execute(id: number, companyId: number) {
    return this.repository.findById(id, companyId);
  }
}
