-- English description for the /en pages. Null (or empty) means the Indonesian `description` is shown instead.
-- The existing read policies cover every column, so nothing else changes.
alter table public.competitions
  add column description_en text check (description_en is null or char_length(description_en) <= 2000);
