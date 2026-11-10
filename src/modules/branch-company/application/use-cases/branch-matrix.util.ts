import { ConflictException } from '@nestjs/common';

/** Traduce la violación del índice único de matriz (carrera entre dos peticiones) a un error entendible. */
export function mapMatrixConflict(error: any): never {
	if (error?.code === '23505' && String(error?.constraint || error?.detail || '').toLowerCase().includes('matrix')) {
		throw new ConflictException('La empresa ya tiene una sucursal matriz. Una empresa solo puede tener una.');
	}
	throw error;
}
