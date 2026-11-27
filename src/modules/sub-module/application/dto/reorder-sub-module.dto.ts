import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderSubModulesDto {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	moduleId: number;

	// Ids de los submódulos del módulo, en el orden nuevo (la posición 1 es el primero del menú)
	@IsArray()
	@ArrayNotEmpty()
	@ArrayUnique()
	@Type(() => Number)
	@IsInt({ each: true })
	ids: number[];
}
