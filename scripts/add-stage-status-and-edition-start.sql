-- Etapas con estado (pendiente / en proceso), inicio único del campeonato por edición y partidos sin fecha obligatoria.
-- Idempotente: se puede repetir. No borra datos.
ALTER TABLE public.tab_campeonato_stages ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE public.tab_campeonato_stages ADD COLUMN IF NOT EXISTS started_at timestamp;
ALTER TABLE public.tab_campeonato_stages ADD COLUMN IF NOT EXISTS competition_type_code varchar(50);
ALTER TABLE public.tab_campeonato_stages ADD COLUMN IF NOT EXISTS from_edition boolean NOT NULL DEFAULT false;

ALTER TABLE public.tab_campeonato_category_editions ADD COLUMN IF NOT EXISTS started_at timestamp;
ALTER TABLE public.tab_campeonato_category_editions ADD COLUMN IF NOT EXISTS started_name varchar;

-- El fixture genera solo los encuentros: la fecha se programa después
ALTER TABLE public.tab_campeonato_matches ALTER COLUMN date DROP NOT NULL;

-- Los campeonatos que ya tienen partidos se consideran iniciados, con esas etapas en proceso.
UPDATE public.tab_campeonato_stages s
   SET status = 'IN_PROGRESS', started_at = COALESCE(s.started_at, now())
 WHERE s.status = 'PENDING'
   AND EXISTS (SELECT 1 FROM public.tab_campeonato_matches m WHERE m.stage_id = s.id);

UPDATE public.tab_campeonato_category_editions e
   SET started_at = now()
 WHERE e.started_at IS NULL
   AND EXISTS (
     SELECT 1 FROM public.tab_campeonato_stages s
       JOIN public.tab_campeonato_matches m ON m.stage_id = s.id
      WHERE s.category_edition_id = e.id
   );
