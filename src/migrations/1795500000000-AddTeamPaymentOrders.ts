import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Órdenes de pago de la inscripción de equipos: cabecera (tab_campeonato_team_payment_orders) y detalle por categoría
 * con el subdetalle de conceptos (tab_campeonato_team_payment_order_details.concepts). Idempotente y sin borrar datos.
 * Mismo contenido que scripts/add-team-payment-orders.sql.
 */
export class AddTeamPaymentOrders1795500000000 implements MigrationInterface {
  name = 'AddTeamPaymentOrders1795500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.tab_campeonato_team_payment_orders (
        id serial PRIMARY KEY,
        company_id integer,
        category_edition_id integer REFERENCES public.tab_campeonato_category_editions (id) ON DELETE SET NULL,
        edition_name varchar(150) NOT NULL,
        team_id integer REFERENCES public.tab_campeonato_teams (id) ON DELETE SET NULL,
        team_name varchar(150) NOT NULL,
        total_amount numeric(12,2) NOT NULL DEFAULT 0,
        status varchar(20) NOT NULL DEFAULT 'PENDING',
        created_name varchar,
        created_by varchar,
        created_at timestamp NOT NULL DEFAULT now(),
        update_name varchar,
        updated_by varchar,
        updated_at timestamp DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.tab_campeonato_team_payment_order_details (
        id serial PRIMARY KEY,
        order_id integer NOT NULL REFERENCES public.tab_campeonato_team_payment_orders (id) ON DELETE CASCADE,
        team_registration_id integer REFERENCES public.tab_campeonato_team_registrations (id) ON DELETE SET NULL,
        category_id integer REFERENCES public.tab_campeonato_categories (id) ON DELETE SET NULL,
        category_name varchar(150) NOT NULL,
        subtotal numeric(12,2) NOT NULL DEFAULT 0,
        concepts jsonb NOT NULL DEFAULT '[]'
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_team_payment_orders_company_edition_team ON public.tab_campeonato_team_payment_orders (company_id, category_edition_id, team_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_team_payment_order_details_order ON public.tab_campeonato_team_payment_order_details (order_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS public.tab_campeonato_team_payment_order_details`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.tab_campeonato_team_payment_orders`);
  }
}
