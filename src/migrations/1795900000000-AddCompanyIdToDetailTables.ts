import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Empresa (`company_id`) en las tablas de detalle que no la tenían, para que cabecera y detalle la guarden por igual:
 *   - tab_appointment_items                          (padre: tab_appointments)
 *   - tab_work_order_items                           (padre: tab_work_orders)
 *   - tab_campeonato_stage_template_details          (padre: tab_campeonato_stage_templates; las plantillas compartidas, sin empresa, quedan en NULL)
 *   - tab_campeonato_player_transfer_approvals       (padre: tab_campeonato_player_transfers)
 *   - tab_campeonato_player_registration_history     (padre: tab_campeonato_player_registrations)
 * Idempotente y sin borrar datos: las filas existentes toman la empresa de su padre.
 */
export class AddCompanyIdToDetailTables1795900000000 implements MigrationInterface {
  name = 'AddCompanyIdToDetailTables1795900000000';

  private readonly tables = [
    { table: 'tab_appointment_items', fk: 'appointment_id', parent: 'tab_appointments', index: 'IDX_tab_appointment_items_company' },
    { table: 'tab_work_order_items', fk: 'work_order_id', parent: 'tab_work_orders', index: 'IDX_tab_work_order_items_company' },
    { table: 'tab_campeonato_stage_template_details', fk: 'stage_template_id', parent: 'tab_campeonato_stage_templates', index: 'IDX_tab_campeonato_stage_template_details_company' },
    { table: 'tab_campeonato_player_transfer_approvals', fk: 'transfer_id', parent: 'tab_campeonato_player_transfers', index: 'IDX_tab_campeonato_player_transfer_approvals_company' },
    { table: 'tab_campeonato_player_registration_history', fk: 'player_registration_id', parent: 'tab_campeonato_player_registrations', index: 'IDX_tab_campeonato_player_registration_history_company' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { table, fk, parent, index } of this.tables) {
      await queryRunner.query(`ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS company_id integer`);
      await queryRunner.query(`
        UPDATE public.${table} d
           SET company_id = p.company_id
          FROM public.${parent} p
         WHERE d.${fk} = p.id AND d.company_id IS NULL AND p.company_id IS NOT NULL
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "${index}" ON public.${table} (company_id)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const { table, index } of this.tables) {
      await queryRunner.query(`DROP INDEX IF EXISTS public."${index}"`);
      await queryRunner.query(`ALTER TABLE public.${table} DROP COLUMN IF EXISTS company_id`);
    }
  }
}
