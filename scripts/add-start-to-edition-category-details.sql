-- El campeonato se inicia por categoría de la edición (antes, toda la edición a la vez).
-- Idempotente: se puede repetir. No borra datos.
ALTER TABLE public.tab_campeonato_edition_category_details ADD COLUMN IF NOT EXISTS started_at timestamp;
ALTER TABLE public.tab_campeonato_edition_category_details ADD COLUMN IF NOT EXISTS started_name varchar;

-- Las categorías que ya tenían una etapa iniciada quedan iniciadas, con la fecha y el usuario del inicio de su edición
UPDATE public.tab_campeonato_edition_category_details d
   SET started_at = COALESCE(e.started_at, now()), started_name = e.started_name
  FROM public.tab_campeonato_category_editions e
 WHERE e.id = d.edition_id
   AND d.started_at IS NULL
   AND EXISTS (
     SELECT 1 FROM public.tab_campeonato_stages s
      WHERE s.category_edition_id = d.edition_id
        AND s.category_id = d.category_id
        AND s.status <> 'PENDING'
   );
