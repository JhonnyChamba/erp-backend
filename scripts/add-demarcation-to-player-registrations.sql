-- Demarcación / posición en campo de cada jugador inscrito en una plantilla (opcional; si no se elige, vale la del jugador).
-- Idempotente: se puede repetir. No borra datos.
ALTER TABLE public.tab_campeonato_player_registrations ADD COLUMN IF NOT EXISTS demarcation_id integer;

DO $demarcation$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_tab_campeonato_player_registrations_demarcation') THEN
    ALTER TABLE public.tab_campeonato_player_registrations
      ADD CONSTRAINT "FK_tab_campeonato_player_registrations_demarcation"
      FOREIGN KEY (demarcation_id) REFERENCES public.tab_campeonato_demarcations (id) ON DELETE SET NULL;
  END IF;
END
$demarcation$;

-- Las inscripciones existentes quedan con la demarcación que hoy tiene su jugador.
UPDATE public.tab_campeonato_player_registrations pr
   SET demarcation_id = p.demarcation_id
  FROM public.tab_campeonato_players p
 WHERE pr.player_id = p.id
   AND pr.demarcation_id IS NULL
   AND p.demarcation_id IS NOT NULL;
