-- Display order of the competitions on the landing page and the register page (08): lowest first.
-- created_at can't decide it: the seed inserts both competitions in one statement, with the same timestamp.
alter table public.competitions
  add column sort_order smallint not null default 0;

comment on column public.competitions.sort_order is 'Display order, lowest first. Ties fall back to created_at.';

-- Existing rows: Competitive Programming first, the logic competition (Logic Rally Games) second.
update public.competitions
set sort_order = case type when 'competitive_programming' then 1 when 'logic' then 2 else 0 end;
