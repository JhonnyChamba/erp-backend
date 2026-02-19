import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../domain/repositories/users.repository";

@Injectable()
export class FindUserByEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) { }

  async execute(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
