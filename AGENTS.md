# Estándares de Arquitectura Backend - Deskounta ERP (`erp-backend`)

Este archivo define las reglas obligatorias de diseño, estructura y desarrollo backend para todos los desarrolladores y agentes de IA en este repositorio.

---

## 1. Subagente Especializado: `crud-architect`
Para la generación, mantenimiento o refactorización de cualquier módulo en este backend, invoca al agente **`crud-architect`**.

---

## 2. Arquitectura Obligatoria: NestJS Clean / Hexagonal
Directorio base: `src/modules/<modulo>/`

Todo módulo CRUD debe dividirse estrictamente en 4 capas desacopladas:

```
src/modules/<modulo>/
├── domain/
│   ├── entities/<modulo>.entity.ts          # Clase pura TypeScript (sin decoradores TypeORM ni acoplamientos)
│   └── repositories/<modulo>.repository.ts  # Interfaz abstracta con métodos create, findById, findByCompany, update, delete
├── application/
│   ├── dto/
│   │   ├── create-<modulo>.dto.ts           # DTO con validaciones class-validator (@IsNotEmpty, @IsString, etc.)
│   │   ├── update-<modulo>.dto.ts           # DTO con campos opcionales (@IsOptional)
│   │   └── list-<modulo>.dto.ts             # DTO para paginación y filtros (page, limit, search)
│   └── use-cases/
│       ├── create-<modulo>.use-case.ts      # Caso de uso atómico inyectable (@Injectable)
│       ├── list-<modulo>.use-case.ts
│       ├── get-<modulo>.use-case.ts
│       ├── update-<modulo>.use-case.ts
│       └── delete-<modulo>.use-case.ts
├── infrastructure/
│   ├── persistence/<modulo>.orm-entity.ts   # Entidad TypeORM mapeada a tab_<modulo>
│   └── repositories/<modulo>.repository.impl.ts # Implementación de la interfaz de dominio usando TypeORM
├── presentation/
│   └── <modulo>.controller.ts               # Controlador HTTP REST
└── <modulo>.module.ts                       # Módulo NestJS que enlaza proveedores y use cases
```

---

## 3. Reglas de Oro del Backend

1. **Aislamiento Multi-Tenant**:
   - Todo módulo debe estar vinculado a `company_id`.
   - El controlador debe extraer `companyId` desde `req.companyId || req.user?.companyId || 1`.
   - Todas las consultas de listado y búsqueda deben filtrar obligatoriamente por la empresa activa (`company: { id: companyId }` o `company_id = :companyId`).
2. **Soft Delete**:
   - La tabla debe tener el campo `deleted: boolean` (default false).
   - El método de eliminación (`delete`) nunca debe hacer `DELETE` físico en SQL; debe actualizar `deleted: true, enabled: false`.
   - Todas las búsquedas (`find`, `findOne`) deben incluir `deleted: false`.
3. **Seguridad y Guards**:
   - Todos los controladores deben estar protegidos con `@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)`.
4. **Mapeo Limpio (toDomain / toOrmEntity)**:
   - El repositorio de infraestructura debe implementar `toDomain` y `toOrmEntity` para aislar el modelo de base de datos de la lógica de negocio.
5. **Verificación de Compilación**:
   - Todo cambio o nuevo módulo debe compilar exitosamente con `npm run build` (`nest build`) sin errores de TypeScript.
