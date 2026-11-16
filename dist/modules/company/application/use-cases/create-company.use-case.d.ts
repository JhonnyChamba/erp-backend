import { CompanyRepository } from '../../domain/repositories/company.repository';
import { Company } from '../../domain/entities/company.entity';
import { CreateCompanyDto } from '../dto/create-company.dto';
export declare class CreateCompanyUseCase {
    private readonly repository;
    constructor(repository: CompanyRepository);
    execute(dto: CreateCompanyDto, user: any): Promise<Company>;
}
