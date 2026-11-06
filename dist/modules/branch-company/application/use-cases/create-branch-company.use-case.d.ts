import { BranchCompanyRepository } from '../../domain/repositories/branch-company.repository';
import { BranchCompany } from '../../domain/entities/branch-company.entity';
import { CreateBranchCompanyDto } from '../dto/create-branch-company.dto';
export declare class CreateBranchCompanyUseCase {
    private readonly repository;
    constructor(repository: BranchCompanyRepository);
    execute(dto: CreateBranchCompanyDto, user: any): Promise<BranchCompany>;
}
