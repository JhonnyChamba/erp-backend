import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerOrmEntity } from '../../infrastructure/persistence/player.orm-entity';
import { CompanyPlayerOrmEntity } from '../../infrastructure/persistence/company-player.orm-entity';
import { PlayerTransactionOrmEntity } from '../../infrastructure/persistence/player-transaction.orm-entity';
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
   * Listar jugadores de la liga/empresa actual
   */
  async list(companyId: number, query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.demarcation', 'demarcation')
      .leftJoinAndSelect('p.playerClassification', 'playerClassification')
      .leftJoin('tab_campeonato_company_players', 'cp', 'cp.player_id = p.id');

    if (companyId) {
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

  async get(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['demarcation', 'playerClassification'],
    });
    if (!item) throw new NotFoundException('Jugador no encontrado');
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
      // Ya existe globalmente. Asegurar vinculación en la tabla intermedia de la empresa
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

  async update(id: string, dto: UpdatePlayerDto, user: any) {
    const item = await this.get(id);

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

  async remove(id: string) {
    const item = await this.get(id);
    return this.repo.remove(item);
  }
}
