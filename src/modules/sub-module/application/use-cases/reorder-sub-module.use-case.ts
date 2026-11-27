import { BadRequestException, Injectable } from '@nestjs/common';
import { subModulesRepository } from '../../domain/repositories/sub-module.repository';
import { ReorderSubModulesDto } from '../dto/reorder-sub-module.dto';

@Injectable()
export class ReordersubModulesUseCase {
	constructor(private readonly repository: subModulesRepository) { }

	async execute(dto: ReorderSubModulesDto) {
		// El nuevo orden debe incluir todos los submódulos del módulo y ninguno de otro: así las posiciones quedan 1..n sin repetirse
		const current = await this.repository.findByCompany(dto.moduleId, 1, 10000);
		const currentIds = new Set(current.data.map((subModule) => Number(subModule.id)));

		if (dto.ids.length !== currentIds.size || dto.ids.some((id) => !currentIds.has(Number(id)))) {
			throw new BadRequestException('La lista debe contener exactamente los submódulos del módulo, sin repetir ni agregar otros');
		}

		await this.repository.reorder(dto.moduleId, dto.ids);

		return { success: true, message: 'Orden de submódulos actualizado' };
	}
}
