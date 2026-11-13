import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeCategoryOrmEntity } from '../infrastructure/persistence/employee-category.orm-entity';
import { CreateEmployeeCategoryDto, UpdateEmployeeCategoryDto } from './dto/employee-category.dto';

@Injectable()
export class EmployeeCategoryService {
	constructor(
		@InjectRepository(EmployeeCategoryOrmEntity)
		private readonly categoryRepo: Repository<EmployeeCategoryOrmEntity>,
	) {}

	async list(companyId: number, activeOnly: boolean = false): Promise<EmployeeCategoryOrmEntity[]> {
		const qb = this.categoryRepo
			.createQueryBuilder('c')
			.where('c.company_id = :companyId AND c.deleted = false', { companyId })
			.orderBy('c.name', 'ASC');

		if (activeOnly) {
			qb.andWhere('c.active = true');
		}

		return qb.getMany();
	}

	async getById(id: number, companyId: number): Promise<EmployeeCategoryOrmEntity> {
		const category = await this.categoryRepo.findOne({
			where: { id, company_id: companyId, deleted: false },
		});
		if (!category) {
			throw new NotFoundException(`Categoría/Cargo con ID ${id} no encontrado.`);
		}
		return category;
	}

	async create(companyId: number, dto: CreateEmployeeCategoryDto): Promise<EmployeeCategoryOrmEntity> {
		const entity = this.categoryRepo.create({
			...dto,
			company_id: companyId,
		});
		return this.categoryRepo.save(entity);
	}

	async update(id: number, companyId: number, dto: UpdateEmployeeCategoryDto): Promise<EmployeeCategoryOrmEntity> {
		const category = await this.getById(id, companyId);
		Object.assign(category, dto);
		return this.categoryRepo.save(category);
	}

	async toggleStatus(id: number, companyId: number): Promise<EmployeeCategoryOrmEntity> {
		const category = await this.getById(id, companyId);
		category.active = !category.active;
		return this.categoryRepo.save(category);
	}

	async remove(id: number, companyId: number): Promise<void> {
		const category = await this.getById(id, companyId);
		category.deleted = true;
		await this.categoryRepo.save(category);
	}
}

