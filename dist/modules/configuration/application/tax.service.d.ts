import { Repository } from 'typeorm';
import { TaxOrmEntity } from '../infrastructure/persistence/tax.orm-entity';
import { CreateTaxDto, UpdateTaxDto } from './dto/tax.dto';
export declare class TaxService {
    private readonly taxRepo;
    constructor(taxRepo: Repository<TaxOrmEntity>);
    private ensureDefaultTaxes;
    list(companyId: number, onlyActive?: boolean): Promise<TaxOrmEntity[]>;
    get(id: number, companyId: number): Promise<TaxOrmEntity>;
    create(companyId: number, dto: CreateTaxDto): Promise<TaxOrmEntity>;
    update(id: number, companyId: number, dto: UpdateTaxDto): Promise<TaxOrmEntity>;
    toggleStatus(id: number, companyId: number): Promise<TaxOrmEntity>;
    remove(id: number, companyId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
