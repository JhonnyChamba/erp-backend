import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Empresa en el detalle de las órdenes de pago de equipos (tab_campeonato_team_payment_order_details.company_id), como el resto de
 * las tablas del campeonato. Idempotente y sin borrar datos: las líneas existentes toman la empresa de su orden.
 */
export class AddCompanyIdToTeamPaymentOrderDetails1795800000000 implements MigrationInterface {
  name = 'AddCompanyIdToTeamPaymentOrderDetails1795800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_team_payment_order_details ADD COLUMN IF NOT EXISTS company_id integer`);
    await queryRunner.query(`
      UPDATE public.tab_campeonato_team_payment_order_details d
         SET company_id = o.company_id
        FROM public.tab_campeonato_team_payment_orders o
       WHERE d.order_id = o.id AND d.company_id IS NULL AND o.company_id IS NOT NULL
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tab_campeonato_team_payment_order_details_company" ON public.tab_campeonato_team_payment_order_details (company_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS public."IDX_tab_campeonato_team_payment_order_details_company"`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_team_payment_order_details DROP COLUMN IF EXISTS company_id`);
  }
}
