import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCampeonatoModule1795000000000 implements MigrationInterface {
  name = 'SeedCampeonatoModule1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Asegurar la existencia del módulo de Campeonato en tab_module
    await queryRunner.query(`
      INSERT INTO "tab_module" ("code", "desc_icon", "description", "order_index", "enabled", "deleted")
      SELECT 'MOD-010', 'solar:cup-first-bold-duotone', 'Campeonato', 10, true, false
      WHERE NOT EXISTS (
        SELECT 1 FROM "tab_module" WHERE "code" = 'MOD-010' OR LOWER("description") LIKE '%campeonato%'
      );
    `);

    // 2. Obtener el ID del módulo registrado
    const modRows = await queryRunner.query(`
      SELECT "id" FROM "tab_module" WHERE "code" = 'MOD-010' OR LOWER("description") LIKE '%campeonato%' LIMIT 1;
    `);

    if (modRows && modRows.length > 0) {
      const moduleId = modRows[0].id;

      // 3. Insertar submódulos asociados a Campeonato
      const submodules = [
        { code: 'SUB-CAMP-001', icon: 'solar:shield-star-bold-duotone', desc: 'Equipos', url: '/campeonato?tab=teams', order: 1 },
        { code: 'SUB-CAMP-002', icon: 'solar:user-bold-duotone', desc: 'Jugadores', url: '/campeonato?tab=players', order: 2 },
        { code: 'SUB-CAMP-003', icon: 'solar:layers-bold-duotone', desc: 'Categorías', url: '/campeonato?tab=categories', order: 3 },
        { code: 'SUB-CAMP-004', icon: 'solar:calendar-date-bold-duotone', desc: 'Ediciones de Categoría', url: '/campeonato?tab=categoryEditions', order: 4 },
        { code: 'SUB-CAMP-005', icon: 'solar:flag-2-bold-duotone', desc: 'Etapas y Fases', url: '/campeonato?tab=stages', order: 5 },
        { code: 'SUB-CAMP-006', icon: 'solar:map-point-bold-duotone', desc: 'Escenarios Deportivos', url: '/campeonato?tab=scenaries', order: 6 },
        { code: 'SUB-CAMP-007', icon: 'solar:users-group-two-rounded-bold-duotone', desc: 'Inscripción de Equipos', url: '/campeonato?tab=teamRegistrations', order: 7 },
        { code: 'SUB-CAMP-008', icon: 'solar:card-2-bold-duotone', desc: 'Inscripción y Carnets', url: '/campeonato?tab=playerRegistrations', order: 8 },
        { code: 'SUB-CAMP-009', icon: 'solar:whistle-bold-duotone', desc: 'Árbitros', url: '/campeonato?tab=referees', order: 9 },
        { code: 'SUB-CAMP-010', icon: 'solar:notebook-bold-duotone', desc: 'Vocales', url: '/campeonato?tab=vocals', order: 10 },
        { code: 'SUB-CAMP-011', icon: 'solar:football-bold-duotone', desc: 'Partidos y Encuentros', url: '/campeonato?tab=matches', order: 11 },
        { code: 'SUB-CAMP-012', icon: 'solar:danger-triangle-bold-duotone', desc: 'Sanciones y Multas', url: '/campeonato?tab=sanctions', order: 12 },
        { code: 'SUB-CAMP-013', icon: 'solar:wallet-money-bold-duotone', desc: 'Pagos e Ingresos', url: '/campeonato?tab=payments', order: 13 },
        { code: 'SUB-CAMP-014', icon: 'solar:diploma-verified-bold-duotone', desc: 'Cargos y Roles', url: '/campeonato?tab=positions', order: 14 },
        { code: 'SUB-CAMP-015', icon: 'solar:compass-bold-duotone', desc: 'Demarcaciones', url: '/campeonato?tab=demarcations', order: 15 },
      ];

      for (const sm of submodules) {
        await queryRunner.query(`
          INSERT INTO "tab_sub_module" ("code", "desc_icon", "description", "url_desc", "order_index", "module_id", "enabled", "deleted")
          SELECT '${sm.code}', '${sm.icon}', '${sm.desc}', '${sm.url}', ${sm.order}, ${moduleId}, true, false
          WHERE NOT EXISTS (
            SELECT 1 FROM "tab_sub_module" WHERE "code" = '${sm.code}'
          );
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "tab_sub_module" WHERE "code" LIKE 'SUB-CAMP-%';
    `);
    await queryRunner.query(`
      DELETE FROM "tab_module" WHERE "code" = 'MOD-010';
    `);
  }
}
