import { UserCompanyRepository } from '../../domain/repositories/user-company.repository';
import { UserCompany } from '../../domain/entities/user-company.entity';
import { CreateUserCompanyDto } from '../dto/create-user-company.dto';
export declare class CreateUserCompanyUseCase {
    private readonly repository;
    constructor(repository: UserCompanyRepository);
    execute(dto: CreateUserCompanyDto, user: any): Promise<UserCompany>;
}
