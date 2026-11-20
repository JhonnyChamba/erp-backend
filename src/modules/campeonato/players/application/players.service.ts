import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { CompanyPlayerOrmEntity } from '../../infrastructure/persistence/company-player.orm-entity';
import { PlayerTransactionOrmEntity } from '../../infrastructure/persistence/player-transaction.orm-entity';
import { PlayerRegistrationOrmEntity } from '../../infrastructure/persistence/player-registration.orm-entity';
import { PlayerTransferOrmEntity } from '../../infrastructure/persistence/player-transfer.orm-entity';
import { isPlayerInCompany } from '../../common/company-scope.util';
import { CreatePlayerDto, UpdatePlayerDto } from './dto/player.dto';

export function calculateAge(birthDateStr?: string | Date): { ageYears: number; ageMonths: number } | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
    years--;
  }
  return {
    ageYears: Math.max(0, years),
    ageMonths: Math.max(0, months),
  };
}

export function validarCedulaEcuador(cedula: string): boolean {
  if (!cedula || !/^\d{10}$/.test(cedula.trim())) return false;
  const prov = parseInt(cedula.substring(0, 2), 10);
  if (!((prov >= 1 && prov <= 24) || prov === 30)) return false;
  if (parseInt(cedula.charAt(2), 10) >= 6) return false;

  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let p = parseInt(cedula.charAt(i), 10) * coef[i];
    if (p >= 10) p -= 9;
    sum += p;
  }
  const digitoVerificador = sum % 10 === 0 ? 0 : 10 - (sum % 10);
  return digitoVerificador === parseInt(cedula.charAt(9), 10);
}
@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(PlayerOrmEntity)
    private readonly repo: Repository<PlayerOrmEntity>,

    @InjectRepository(CompanyPlayerOrmEntity)
    private readonly companyPlayerRepo: Repository<CompanyPlayerOrmEntity>,

    @InjectRepository(PlayerTransactionOrmEntity)
    private readonly transactionRepo: Repository<PlayerTransactionOrmEntity>,
  ) {}

  /**
   * Buscar jugador en el padrón global por cédula/identificación
   */
  async findGlobalByIdentification(identification: string, companyId?: number) {
    const ident = identification?.trim();
    if (!ident) return { exists: false, player: null };

    const player = await this.repo.findOne({
      where: { identification: ident },
      relations: ['demarcation', 'playerClassification'],
    });

    if (!player) {
      return { exists: false, player: null };
    }

    let isLinkedToCurrentCompany = false;
    if (companyId) {
      const link = await this.companyPlayerRepo.findOne({
        where: { companyId, playerId: player.id },
      });
      isLinkedToCurrentCompany = Boolean(link);
    }

    return {
      exists: true,
      player,
      isLinkedToCurrentCompany,
    };
  }

  /**
   * Consulta oficial de identidad / Registro Civil por cédula
   */
  async consultaRegistroCivil(identification: string, companyId?: number) {
    const ident = (identification || '').trim();
    if (!ident) {
      throw new BadRequestException('El número de cédula es obligatorio');
    }

    const isValid = validarCedulaEcuador(ident);
    if (!isValid) {
      throw new BadRequestException('El número ingresado no es una cédula ecuatoriana válida');
    }

    // 1. Primero consultar en el padrón local (base de datos)
    const local = await this.findGlobalByIdentification(ident, companyId);
    if (local.exists && local.player) {
      return {
        exists: true,
        source: 'LOCAL_PADRON' as const,
        isValidCedula: true,
        player: local.player,
        isLinkedToCurrentCompany: local.isLinkedToCurrentCompany,
      };
    }

    // 2. Si no está en el padrón local, consultar proveedor externo (Registro Civil / EcuadorAPI)
    const apiUrl = process.env.REGISTRO_CIVIL_API_URL || 'https://api.ecuadorapi.com/v1/cedula';
    const apiKey = process.env.REGISTRO_CIVIL_API_KEY || '';

    if (apiKey) {
      try {
        const url = apiUrl.endsWith('/') ? `${apiUrl}${ident}` : `${apiUrl}/${ident}`;
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
        });

        if (resp.ok) {
          const raw = (await resp.json()) as any;
          const d = raw?.data || raw;

          let name = d.nombres || d.first_name || '';
          let lastName = d.apellidos || d.last_name || '';

          if (!name && !lastName && (d.nombre_completo || d.full_name || d.nombre)) {
            const full = (d.nombre_completo || d.full_name || d.nombre).trim().split(/\s+/);
            if (full.length >= 4) {
              lastName = `${full[0]} ${full[1]}`;
              name = full.slice(2).join(' ');
            } else if (full.length === 3) {
              lastName = `${full[0]} ${full[1]}`;
              name = full[2];
            } else if (full.length === 2) {
              lastName = full[0];
              name = full[1];
            } else {
              name = full[0] || '';
            }
          }

          let birthDate = d.fecha_nacimiento || d.birth_date || null;
          if (birthDate && String(birthDate).length >= 10) {
            birthDate = String(birthDate).slice(0, 10);
          }

          const address = d.direccion || d.domicilio || d.lugar_nacimiento || d.residencia || '';
          const gender = d.genero || d.sexo || '';

          return {
            exists: true,
            source: 'REGISTRO_CIVIL' as const,
            isValidCedula: true,
            player: {
              identification: ident,
              name: name.trim(),
              lastName: lastName.trim(),
              birthDate,
              gender: gender.toUpperCase().startsWith('M') ? 'MALE' : gender.toUpperCase().startsWith('F') ? 'FEMALE' : undefined,
              address: address.trim(),
            },
          };
        }
      } catch (err) {
        console.warn('Error al consultar proveedor externo de Registro Civil:', err);
      }
    }

    // 3. Si la cédula es válida pero no figura en registros previos
    return {
      exists: false,
      source: null,
      isValidCedula: true,
      player: { identification: ident },
      message: 'Cédula válida. Puedes ingresar los datos del futbolista.',
    };
  }

  /**
   * Listar jugadores de la liga/empresa actual o padrón global
   */
  async list(companyId: number, query: { page?: number; limit?: number; search?: string; global?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;
    const isGlobal = query.global === 'true' || !companyId;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.demarcation', 'demarcation')
      .leftJoinAndSelect('p.playerClassification', 'playerClassification');

    if (!isGlobal) {
      qb.leftJoin('tab_campeonato_company_players', 'cp', 'cp.player_id = p.id');
      qb.where('(cp.company_id = :companyId OR p.companyId = :companyId)', { companyId });
    }

    if (query.search?.trim()) {
      qb.andWhere('(LOWER(p.name) LIKE :term OR LOWER(p.lastName) LIKE :term OR LOWER(p.identification) LIKE :term OR LOWER(p.code) LIKE :term)', {
        term: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * El jugador pertenece a un padrón global: por :id solo lo ve/edita una empresa que lo tenga vinculado.
   * Un super admin administra el padrón global completo (Configuración global).
   */
  async get(id: string | number, companyId: number, user?: any) {
    const item = await this.repo.findOne({
      where: { id: Number(id) },
      relations: ['demarcation', 'playerClassification'],
    });
    if (!item) throw new NotFoundException('Jugador no encontrado');
    const isSuperAdmin = Boolean(user?.super_admin || user?.developer);
    if (!isSuperAdmin && !(await isPlayerInCompany(this.repo.manager, item.id, companyId))) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return item;
  }

  /**
   * Crear o vincular jugador:
   * 1. Si existe en la tabla global: se asocia a la empresa en la tabla intermedia.
   * 2. Si no existe: se crea en la global (secuencial JUG-XXXXX, dueño de pase) y se asocia a la empresa.
   */
  async create(dto: CreatePlayerDto, user: any, companyId: number) {
    const ident = dto.identification?.trim();
    if (!ident) {
      throw new BadRequestException('El número de identificación es obligatorio.');
    }

    // Validar cédula ecuatoriana si es de 10 dígitos numéricos
    if (/^\d{10}$/.test(ident)) {
      if (!validarCedulaEcuador(ident)) {
        throw new BadRequestException('El número ingresado no es una cédula ecuatoriana válida (algoritmo Módulo 10).');
      }
    }

    const userId = user?.user_id?.toString() || user?.id?.toString();
    const userName = user?.user_name || user?.name || 'Sistema';

    // 1. Verificar si ya existe en el padrón global
    let player = await this.repo.findOne({ where: { identification: ident } });

    if (player) {
      // Ya existe globalmente: se actualizan solo los datos informativos editables.
      // Nombres, apellidos, cédula, fecha de nacimiento y edad en años no se modifican.
      const informative: Record<string, any> = {};
      for (const f of [
        'emergencyContactPhone',
        'emergencyContactName',
        'email',
        'phone',
        'bloodType',
        'dominantFoot',
        'playerClassificationId',
        'demarcationId',
      ] as const) {
        const v = (dto as any)[f];
        if (v !== undefined) informative[f] = v === '' ? null : v;
      }
      const ageCalcExisting = calculateAge(player.birthDate);
      if (ageCalcExisting) informative.ageMonths = ageCalcExisting.ageMonths;
      else if (dto.ageMonths !== undefined) informative.ageMonths = dto.ageMonths;
      if (Object.keys(informative).length) {
        informative.updatedBy = userId;
        informative.updateName = userName;
        await this.repo.update(player.id, informative);
        Object.assign(player, informative);
      }

      // Asegurar vinculación en la tabla intermedia de la empresa
      const existingLink = await this.companyPlayerRepo.findOne({
        where: { companyId, playerId: player.id },
      });

      if (!existingLink) {
        await this.companyPlayerRepo.save(
          this.companyPlayerRepo.create({
            companyId,
            playerId: player.id,
            status: 'ACTIVE',
            createdBy: userId,
            createdName: userName,
          }),
        );

        // Registrar transacción de vinculación a la liga
        await this.transactionRepo.save(
          this.transactionRepo.create({
            playerId: player.id,
            companyId,
            transactionType: 'COMPANY_LINK',
            description: `Futbolista vinculado a la empresa/liga #${companyId}`,
            createdBy: userId,
            createdName: userName,
          }),
        );
      }

      return player;
    }

    // 2. No existe: Generar código secuencial global automático JUG-XXXXX
    let playerCode = dto.code?.trim();
    if (!playerCode) {
      const latest = await this.repo
        .createQueryBuilder('p')
        .where("p.code LIKE 'JUG-%'")
        .orderBy('p.createdAt', 'DESC')
        .getOne();

      let nextNum = 1;
      if (latest && latest.code) {
        const m = latest.code.match(/JUG-(\d+)/i);
        if (m) nextNum = parseInt(m[1], 10) + 1;
        else nextNum = (await this.repo.count()) + 1;
      } else {
        nextNum = (await this.repo.count()) + 1;
      }
      playerCode = `JUG-${String(nextNum).padStart(5, '0')}`;
    }

    // Calcular edad en años y meses
    const ageCalc = calculateAge(dto.birthDate);
    const ageYears = dto.ageYears !== undefined ? dto.ageYears : (ageCalc?.ageYears ?? null);
    const ageMonths = dto.ageMonths !== undefined ? dto.ageMonths : (ageCalc?.ageMonths ?? null);

    // Crear en padrón global: dueño de su pase por defecto y activo
    player = this.repo.create({
      ...dto,
      code: playerCode,
      identification: ident,
      passOwnerType: 'PLAYER',
      isActive: true,
      ageYears: ageYears !== null ? ageYears : undefined,
      ageMonths: ageMonths !== null ? ageMonths : undefined,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      companyId,
      createdBy: userId,
      createdName: userName,
    });

    const savedPlayer = await this.repo.save(player);

    // 3. Vincular a la empresa actual en la tabla intermedia
    await this.companyPlayerRepo.save(
      this.companyPlayerRepo.create({
        companyId,
        playerId: savedPlayer.id,
        status: 'ACTIVE',
        createdBy: userId,
        createdName: userName,
      }),
    );

    // 4. Registrar transacción inicial
    await this.transactionRepo.save(
      this.transactionRepo.create({
        playerId: savedPlayer.id,
        companyId,
        transactionType: 'INITIAL_REGISTRATION',
        description: `Registro inicial en el sistema con código ${playerCode}`,
        createdBy: userId,
        createdName: userName,
      }),
    );

    return savedPlayer;
  }

  async update(id: string | number, dto: UpdatePlayerDto, user: any, companyId: number) {
    const item = await this.get(id, companyId, user);

    const targetIdent = dto.identification !== undefined ? dto.identification?.trim() : item.identification;
    if (targetIdent && /^\d{10}$/.test(targetIdent)) {
      if (!validarCedulaEcuador(targetIdent)) {
        throw new BadRequestException('El número ingresado no es una cédula ecuatoriana válida (algoritmo Módulo 10).');
      }
    }

    let ageYears = dto.ageYears !== undefined ? dto.ageYears : item.ageYears;
    let ageMonths = dto.ageMonths !== undefined ? dto.ageMonths : item.ageMonths;
    if (dto.birthDate) {
      const ageCalc = calculateAge(dto.birthDate);
      if (ageCalc) {
        ageYears = ageCalc.ageYears;
        ageMonths = ageCalc.ageMonths;
      }
    }

    Object.assign(item, dto, {
      ageYears,
      ageMonths,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : item.birthDate,
      updatedBy: user?.user_id?.toString() || user?.id?.toString(),
      updateName: user?.user_name || user?.name,
    });
    return this.repo.save(item);
  }

  /**
   * "Eliminar" un jugador desde una empresa lo DESVINCULA de esa empresa. El borrado físico del padrón
   * global (que arrastra por CASCADE inscripciones, transferencias e historial de todas las ligas) solo
   * ocurre si el jugador no tiene ninguna inscripción ni transferencia y ninguna otra empresa lo usa.
   * Con `?global=true` (solo super admin, Configuración global) se elimina del padrón global, también
   * únicamente si no tiene inscripciones ni transferencias en ninguna liga.
   */
  async remove(id: string | number, companyId: number, user?: any, isGlobal = false) {
    const registrationRepo = this.repo.manager.getRepository(PlayerRegistrationOrmEntity);
    const transferRepo = this.repo.manager.getRepository(PlayerTransferOrmEntity);

    if (isGlobal) {
      if (!user?.super_admin && !user?.developer) {
        throw new ForbiddenException('Solo un super administrador puede eliminar jugadores del padrón global.');
      }
      const player = await this.get(id, companyId, user);
      const registrations = await registrationRepo.count({ where: { playerId: player.id } });
      const transfers = await transferRepo.count({ where: { playerId: player.id } });
      if (registrations > 0 || transfers > 0) {
        throw new BadRequestException(
          `No se puede eliminar al jugador del padrón global porque tiene ${registrations} inscripción(es) y ${transfers} transferencia(s) registradas.`,
        );
      }
      await this.repo.remove(player);
      return { success: true, deleted: true, unlinked: true, message: 'Jugador eliminado del padrón global' };
    }

    const item = await this.get(id, companyId);

    const ownRegistrations = await registrationRepo.count({ where: { playerId: item.id, companyId } });
    const ownTransfers = await transferRepo.count({ where: { playerId: item.id, companyId } });
    if (ownRegistrations > 0 || ownTransfers > 0) {
      throw new BadRequestException(
        `No se puede eliminar al jugador porque tiene ${ownRegistrations} inscripción(es) y ${ownTransfers} transferencia(s) registradas en esta liga.`,
      );
    }

    await this.companyPlayerRepo.delete({ companyId, playerId: item.id });

    const otherLinks = await this.companyPlayerRepo.count({ where: { playerId: item.id } });
    const anyRegistrations = await registrationRepo.count({ where: { playerId: item.id } });
    const anyTransfers = await transferRepo.count({ where: { playerId: item.id } });
    const ownedByThisCompany = Number(item.companyId) === Number(companyId);

    if (otherLinks > 0 || anyRegistrations > 0 || anyTransfers > 0 || !ownedByThisCompany) {
      // Otra liga lo usa (o tiene historial): se conserva en el padrón global, ya sin esta empresa como dueña.
      if (ownedByThisCompany) {
        await this.repo.update(item.id, { companyId: null });
      }
      await this.transactionRepo.save(
        this.transactionRepo.create({
          playerId: item.id,
          companyId,
          transactionType: 'COMPANY_UNLINK',
          description: `Futbolista desvinculado de la empresa/liga #${companyId}`,
          createdBy: user?.user_id?.toString() || user?.id?.toString(),
          createdName: user?.user_name || user?.name || 'Sistema',
        }),
      );
      return { success: true, deleted: false, unlinked: true, message: 'Jugador desvinculado de la liga. Se conserva en el padrón global.' };
    }

    await this.repo.remove(item);
    return { success: true, deleted: true, unlinked: true, message: 'Jugador eliminado' };
  }
}
