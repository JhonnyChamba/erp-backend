-- Categoría de la edición en la que se tramita cada orden de transferencia de jugadores (opcional).
-- Idempotente: se puede repetir. No borra datos.
ALTER TABLE public.tab_campeonato_player_transfers ADD COLUMN IF NOT EXISTS category_id integer;

DO $transfer_category$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_tab_campeonato_player_transfers_category') THEN
    ALTER TABLE public.tab_campeonato_player_transfers
      ADD CONSTRAINT "FK_tab_campeonato_player_transfers_category"
      FOREIGN KEY (category_id) REFERENCES public.tab_campeonato_categories (id) ON DELETE SET NULL;
  END IF;
END
$transfer_category$;

-- Las transferencias existentes toman la categoría de la inscripción del jugador en su club de origen.
UPDATE public.tab_campeonato_player_transfers t
   SET category_id = tr.category_id
  FROM public.tab_campeonato_player_registrations pr
  JOIN public.tab_campeonato_team_registrations tr ON tr.id = pr.team_registration_id
 WHERE t.origin_registration_id = pr.id
   AND t.category_id IS NULL
   AND tr.category_id IS NOT NULL;
