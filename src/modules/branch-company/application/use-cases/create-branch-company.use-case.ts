import { BranchCompanyRepository } from '../../domain/repositories/branch-company.repository';
import { BranchCompany } from '../../domain/entities/branch-company.entity';
import { CreateBranchCompanyDto } from '../dto/create-branch-company.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { mapMatrixConflict } from './branch-matrix.util';

@Injectable()
export class CreateBranchCompanyUseCase {
	constructor(private readonly repository: BranchCompanyRepository) { }

	async execute(dto: CreateBranchCompanyDto, user: any) {
		const code = dto.code.trim();
		if (await this.repository.findByCode(dto.companyId, code)) {
			throw new ConflictException(`Ya existe una sucursal con el establecimiento ${code} en esta empresa.`);
		}

		// La primera sucursal de la empresa es la matriz. Una empresa nunca puede tener dos.
		const isFirst = (await this.repository.countByCompany(dto.companyId)) === 0;
		const isMatrix = isFirst ? true : Boolean(dto.is_matrix);
		if (isMatrix && !isFirst) {
			const matrix = await this.repository.findMatrix(dto.companyId);
			if (matrix) {
				throw new ConflictException(`La empresa ya tiene una sucursal matriz (${matrix.code} - ${matrix.name}). Para cambiarla usa la opción "Marcar como matriz" en la sucursal que será la nueva matriz.`);
			}
		}

		const branch = new BranchCompany(
			null,
			code,
			dto.name.trim(),
			dto.address.trim(),
			dto.companyId,
			true,
			undefined,
			user.user_id, // siempre del token
			dto.emission_point || '001',
			dto.phone?.trim() || null,
			dto.email?.trim() || null,
			isMatrix,
		);

		try {
			return await this.repository.create(branch);
		} catch (error) {
			mapMatrixConflict(error);
		}
	}
}
