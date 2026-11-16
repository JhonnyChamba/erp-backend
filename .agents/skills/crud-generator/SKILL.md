---
name: crud-backend-generator
description: >-
  Guía paso a paso y plantillas estándar para generar o refactorizar módulos CRUD en erp-backend
  siguiendo Clean Architecture / Arquitectura Hexagonal en NestJS.
---

# Generador de Módulos CRUD Backend - Deskounta ERP

Usa esta guía siempre que se requiera crear o refactorizar un módulo en `erp-backend`.

---

## 1. Estructura de Directorios

Crea el módulo dentro de `src/modules/<modulo>/`:

```
src/modules/<modulo>/
├── domain/
│   ├── entities/<modulo>.entity.ts
│   └── repositories/<modulo>.repository.ts
├── application/
│   ├── dto/
│   │   ├── create-<modulo>.dto.ts
│   │   ├── update-<modulo>.dto.ts
│   │   └── list-<modulo>.dto.ts
│   └── use-cases/
│       ├── create-<modulo>.use-case.ts
│       ├── list-<modulo>.use-case.ts
│       ├── get-<modulo>.use-case.ts
│       ├── update-<modulo>.use-case.ts
│       └── delete-<modulo>.use-case.ts
├── infrastructure/
│   ├── persistence/<modulo>.orm-entity.ts
│   └── repositories/<modulo>.repository.impl.ts
├── presentation/
│   └── <modulo>.controller.ts
└── <modulo>.module.ts
```

---

## 2. Plantillas de Código Base

### 2.1. Entidad de Dominio (`domain/entities/<modulo>.entity.ts`)
```ts
export class Modulo {
  constructor(
    public readonly id: number | null,
    public companyId: number,
    public code: string,
    public name: string,
    public description: string | null,
    public enabled: boolean = true,
    public deleted: boolean = false,
    public readonly createdAt?: Date,
  ) {}
}
```

### 2.2. Interfaz de Repositorio (`domain/repositories/<modulo>.repository.ts`)
```ts
import { Modulo } from '../entities/<modulo>.entity';

export abstract class ModuloRepository {
  abstract create(entity: Modulo): Promise<Modulo>;
  abstract findById(id: number, companyId: number): Promise<Modulo | null>;
  abstract findByCompany(companyId: number, page?: number, limit?: number, search?: string): Promise<{ data: Modulo[]; total: number }>;
  abstract update(entity: Modulo): Promise<Modulo>;
  abstract delete(id: number, companyId: number): Promise<void>;
}
```

### 2.3. DTOs de Aplicación (`application/dto/`)
- `create-<modulo>.dto.ts`:
```ts
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateModuloDto {
  @IsNumber()
  @IsOptional()
  companyId?: number;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
```

- `update-<modulo>.dto.ts`:
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateModuloDto } from './create-<modulo>.dto';

export class UpdateModuloDto extends PartialType(CreateModuloDto) {}
```

- `list-<modulo>.dto.ts`:
```ts
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ListModuloDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;

  @IsOptional()
  @IsString()
  search?: string;
}
```

### 2.4. Entidad ORM TypeORM (`infrastructure/persistence/<modulo>.orm-entity.ts`)
```ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

@Entity('tab_<modulo>')
export class ModuloOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CompanyOrmEntity, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: CompanyOrmEntity;

  @Column({ name: 'company_id' })
  company_id: number;

  @Column({ nullable: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
```

### 2.5. Implementación del Repositorio (`infrastructure/repositories/<modulo>.repository.impl.ts`)
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ModuloRepository } from '../../domain/repositories/<modulo>.repository';
import { Modulo } from '../../domain/entities/<modulo>.entity';
import { ModuloOrmEntity } from '../persistence/<modulo>.orm-entity';

@Injectable()
export class ModuloRepositoryImpl implements ModuloRepository {
  constructor(
    @InjectRepository(ModuloOrmEntity)
    private readonly repo: Repository<ModuloOrmEntity>,
  ) {}

  private toDomain(orm: ModuloOrmEntity): Modulo {
    return new Modulo(
      orm.id,
      orm.company_id || orm.company?.id,
      orm.code,
      orm.name,
      orm.description,
      orm.enabled,
      orm.deleted,
      orm.created_at,
    );
  }

  async create(entity: Modulo): Promise<Modulo> {
    const orm = this.repo.create({
      company_id: entity.companyId,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      enabled: entity.enabled,
      deleted: false,
    });
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async findById(id: number, companyId: number): Promise<Modulo | null> {
    const found = await this.repo.findOne({
      where: { id, company_id: companyId, deleted: false },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByCompany(companyId: number, page = 1, limit = 50, search?: string): Promise<{ data: Modulo[]; total: number }> {
    const where: any = { company_id: companyId, deleted: false };
    if (search) {
      where.name = ILike(`%${search}%`);
    }
    const [items, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { data: items.map(i => this.toDomain(i)), total };
  }

  async update(entity: Modulo): Promise<Modulo> {
    const existing = await this.repo.findOne({
      where: { id: entity.id!, company_id: entity.companyId, deleted: false },
    });
    if (!existing) throw new NotFoundException('Registro no encontrado');

    existing.code = entity.code;
    existing.name = entity.name;
    existing.description = entity.description;
    existing.enabled = entity.enabled;

    const saved = await this.repo.save(existing);
    return this.toDomain(saved);
  }

  async delete(id: number, companyId: number): Promise<void> {
    await this.repo.update({ id, company_id: companyId }, { deleted: true, enabled: false });
  }
}
```

### 2.6. Controlador REST (`presentation/<modulo>.controller.ts`)
```ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreateModuloUseCase } from '../application/use-cases/create-<modulo>.use-case';
import { ListModuloUseCase } from '../application/use-cases/list-<modulo>.use-case';
import { GetModuloUseCase } from '../application/use-cases/get-<modulo>.use-case';
import { UpdateModuloUseCase } from '../application/use-cases/update-<modulo>.use-case';
import { DeleteModuloUseCase } from '../application/use-cases/delete-<modulo>.use-case';
import { CreateModuloDto } from '../application/dto/create-<modulo>.dto';
import { UpdateModuloDto } from '../application/dto/update-<modulo>.dto';
import { ListModuloDto } from '../application/dto/list-<modulo>.dto';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('<modulo>')
export class ModuloController {
  constructor(
    private readonly createUseCase: CreateModuloUseCase,
    private readonly listUseCase: ListModuloUseCase,
    private readonly getUseCase: GetModuloUseCase,
    private readonly updateUseCase: UpdateModuloUseCase,
    private readonly deleteUseCase: DeleteModuloUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateModuloDto, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.createUseCase.execute({ ...dto, companyId }, req.user);
  }

  @Get()
  list(@Query() query: ListModuloDto, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.listUseCase.execute(companyId, query);
  }

  @Get(':id')
  get(@Param('id') id: number, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.getUseCase.execute(Number(id), companyId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateModuloDto, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.updateUseCase.execute(Number(id), companyId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.deleteUseCase.execute(Number(id), companyId);
  }
}
```

---

## 3. Verificación
Siempre compilar tras crear o modificar un módulo:
```bash
npm run build
```
Debe compilar con 0 errores.
