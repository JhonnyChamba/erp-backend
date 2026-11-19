import { UsersRepository } from "../../domain/repositories/users.repository";
import { UsersAccessPolicy } from "../users-access.policy";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetUsersUseCase {
  constructor(
    private readonly repository: UsersRepository,
    private readonly accessPolicy: UsersAccessPolicy,
  ) {}

  async execute(id: number, companyId: number, currentUser?: any) {
    // Solo un super admin puede consultar usuarios fuera de la empresa activa
    const isSuperAdmin = (await this.accessPolicy.getActorCompanyIds(currentUser)) === null;
    return this.repository.findById(id, companyId, isSuperAdmin);
  }
}
