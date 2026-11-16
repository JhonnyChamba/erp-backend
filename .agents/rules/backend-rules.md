---
trigger: "glob:src/**/*.ts"
description: "Estándares y restricciones obligatorias para el desarrollo en NestJS Clean Architecture"
---

# Reglas de Backend NestJS - Deskounta ERP

1. Mantener la estructura de 4 capas: `domain`, `application`, `infrastructure`, `presentation`.
2. Las entidades de `domain/entities/` no deben importar nada de `typeorm`.
3. Validar todos los DTOs con `class-validator` y `class-transformer`.
4. Todos los endpoints que operen sobre datos de empresa deben filtrar estrictamente por `companyId`.
5. Implementar siempre soft delete (`deleted: false`).
6. Asegurar que `npm run build` pase con 0 errores antes de dar una tarea por terminada.
