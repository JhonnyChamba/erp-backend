-- Garantía por categoría de la edición: se cobra junto con la inscripción en la orden de pago del equipo.
-- Idempotente: se puede repetir. No borra datos.
ALTER TABLE public.tab_campeonato_edition_category_details ADD COLUMN IF NOT EXISTS guarantee_fee numeric(10,2) NOT NULL DEFAULT 0;
