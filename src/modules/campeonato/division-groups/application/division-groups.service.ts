import { Injectable, NotFoundException } from '@nestjs/common';
import { DivisionGroup } from '../domain/entities/division-group.entity';
import { DivisionGroupRepository } from '../domain/repositories/division-group.repository';
import {
  CreateDivisionGroupDto,
  ListDivisionGroupDto,
  UpdateDivisionGroupDto,
} from './dto/division-group.dto';

@Injectable()
export class DivisionGroupsService {
  constructor(private readonly repository: DivisionGroupRepository) {}

  async list(companyId: number, query: ListDivisionGroupDto) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query?.limit) || 50));
    const { data, total } = await this.repository.findByCompany(
      companyId,
      page,
      limit,
      query?.search,
    );
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async get(id: string | number, companyId: number) {
    const found = await this.repository.findById(Number(id), companyId);
    if (!found) {
      throw new NotFoundException('Grupo de división no encontrado');
    }
    return found;
  }

  async create(dto: CreateDivisionGroupDto, user: any, companyId: number) {
    const code = await this.repository.generateNextCode(companyId);
    const entity = new DivisionGroup(
      null,
      companyId,
      code,
      dto.description.trim(),
      dto.enabled ?? true,
      false,
      user?.user_id?.toString() || user?.id?.toString() || null,
      user?.user_name || user?.name || null,
    );
    return this.repository.create(entity);
  }

  async update(
    id: string | number,
    dto: UpdateDivisionGroupDto,
    user: any,
    companyId: number,
  ) {
    const existing = await this.get(id, companyId);
    if (dto.description !== undefined) {
      existing.description = dto.description.trim();
    }
    if (dto.enabled !== undefined) {
      existing.enabled = dto.enabled;
    }
    existing.updatedBy = user?.user_id?.toString() || user?.id?.toString() || null;
    existing.updateName = user?.user_name || user?.name || null;

    return this.repository.update(existing);
  }

  async remove(id: string | number, companyId: number, user?: any) {
    await this.repository.softDelete(Number(id), companyId, user);
    return { deleted: true };
  }
}
