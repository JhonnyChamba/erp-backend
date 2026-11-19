import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { CompanyPlayerOrmEntity } from '../infrastructure/persistence/company-player.orm-entity';
import { PlayerOrmEntity } from '../infrastructure/persistence/player.orm-entity';

/**
 * Aislamiento por empresa para operaciones por :id.
 *
 * - Registro de otra empresa: se responde 404 (no se revela su existencia).
 * - Registro sin empresa (company_id NULL, datos compartidos/legados): se puede leer, igual que en los
 *   listados, pero no modificar ni eliminar desde una empresa.
 */
export function ensureCompanyScope<T extends { companyId?: number | null }>(
  item: T | null | undefined,
  companyId: number,
  notFoundMessage: string,
  write = false,
): T {
  if (!item) throw new NotFoundException(notFoundMessage);
  const owner = item.companyId;
  if (owner === null || owner === undefined) {
    if (write) {
      throw new ForbiddenException('El registro no pertenece a ninguna empresa y no puede modificarse desde aquí.');
    }
    return item;
  }
  if (Number(owner) !== Number(companyId)) throw new NotFoundException(notFoundMessage);
  return item;
}

/**
 * Valida que un id recibido en el body pertenezca a la empresa activa (o sea un registro compartido).
 * No hace nada si el id no viene informado.
 */
export async function assertBelongsToCompany(
  repo: Repository<any>,
  id: string | number | null | undefined,
  companyId: number,
  notFoundMessage: string,
): Promise<void> {
  if (id === null || id === undefined || id === '' || id === 0) return;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) throw new NotFoundException(notFoundMessage);
  const item = await repo.findOne({ where: { id: numId } });
  ensureCompanyScope(item, companyId, notFoundMessage);
}

/**
 * El jugador vive en un padrón global: una empresa accede a él si lo registró (company_id) o si está
 * vinculado en tab_campeonato_company_players.
 */
export async function isPlayerInCompany(manager: EntityManager, playerId: string | number, companyId: number): Promise<boolean> {
  const numId = Number(playerId);
  if (!Number.isInteger(numId) || numId <= 0) return false;
  const link = await manager.getRepository(CompanyPlayerOrmEntity).findOne({ where: { companyId, playerId: numId } });
  if (link) return true;
  const player = await manager.getRepository(PlayerOrmEntity).findOne({ where: { id: numId } });
  return Boolean(player) && Number(player.companyId) === Number(companyId);
}

export async function assertPlayerInCompany(
  manager: EntityManager,
  playerId: string | number | null | undefined,
  companyId: number,
  notFoundMessage = 'Jugador no encontrado',
): Promise<void> {
  if (playerId === null || playerId === undefined || playerId === '') return;
  if (!(await isPlayerInCompany(manager, playerId, companyId))) throw new NotFoundException(notFoundMessage);
}

/** Id numérico del usuario autenticado (req.user.user_id) o undefined si no es un entero válido. */
export function resolveUserId(user: any): number | undefined {
  const id = Number(user?.user_id ?? user?.id);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}
