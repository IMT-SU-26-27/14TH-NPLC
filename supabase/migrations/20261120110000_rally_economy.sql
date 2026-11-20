-- Rally economy game: an extra game on top of the existing Rally posts (rapat Event x Tech, 20 Nov 2026).
-- The rules are still a draft (Event and the lecturer will change them), so this is a general foundation:
--   * money: a ledger per team; cash is the sum of its entries and never goes below 0
--   * items (attack / defense, optional stock), land (region tag, price, owner, shield), assets (shares)
--   * rounds raise every price by a step, and a promo takes a percentage off
--   * events change cash (defense items can absorb a loss), land prices by region, or asset prices
--   * at the end, land and assets convert to cash
-- Buying happens in a room run by the committee, so every change goes through these functions, called by an
-- admin or an LO. Participants only read: prices, their own team's cash, items, land and shares.
-- Not built yet: one device per team, and what happens when two teams attack the same land at once (row locks
-- make the first attack win for now).

create type public.rally_eco_item_kind as enum ('attack', 'defense');
create type public.rally_eco_entry_kind as enum ('start', 'reward', 'purchase', 'sale', 'attack', 'event', 'adjust', 'final');
create type public.rally_eco_effect as enum ('cash', 'land_price', 'asset_price');

-- ----- Settings, one row per Rally competition -----

create table public.rally_eco_settings (
  competition_id uuid primary key references public.competitions (id) on delete cascade,
  starting_cash integer not null default 0 check (starting_cash >= 0),
  round smallint not null default 1 check (round >= 1),
  round_price_step numeric(6, 2) not null default 0 check (round_price_step >= 0), -- percent added per round
  promo_percent numeric(5, 2) not null default 0 check (promo_percent between 0 and 100),
  started_at timestamptz,
  finalized_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ----- Catalogue -----

create table public.rally_eco_items (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  kind public.rally_eco_item_kind not null,
  price integer not null check (price >= 0),
  power integer not null default 1 check (power >= 0), -- attack: cash taken when not blocked
  stock integer check (stock >= 0), -- null = unlimited
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint rally_eco_items_competition_name_key unique (competition_id, name)
);

create table public.rally_eco_lands (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  region text not null default '' check (char_length(region) <= 40), -- events target land by region, e.g. "hutan"
  price integer not null check (price >= 0), -- before the round step and promo
  owner_registration_id uuid references public.registrations (id) on delete set null,
  shield integer not null default 0 check (shield >= 0), -- defense items placed on this land
  map_x smallint,
  map_y smallint,
  created_at timestamptz not null default now(),
  constraint rally_eco_lands_competition_name_key unique (competition_id, name)
);
create index rally_eco_lands_owner_idx on public.rally_eco_lands (owner_registration_id);

create table public.rally_eco_assets (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  price integer not null check (price >= 0), -- per unit, changed by events
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint rally_eco_assets_competition_name_key unique (competition_id, name)
);

-- Kept from the participants until they happen.
create table public.rally_eco_events (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  effect public.rally_eco_effect not null,
  amount numeric(10, 2) not null, -- cash: money per team (negative = loss); prices: percent change
  region text, -- land_price: only this region (null = all land)
  asset_id uuid references public.rally_eco_assets (id) on delete cascade, -- asset_price: only this asset (null = all)
  defense_needed integer not null default 0 check (defense_needed >= 0), -- cash loss: teams holding this many defense items lose them instead
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----- Team state -----

create table public.rally_eco_inventory (
  registration_id uuid not null references public.registrations (id) on delete cascade,
  item_id uuid not null references public.rally_eco_items (id) on delete restrict,
  quantity integer not null default 0 check (quantity >= 0),
  primary key (registration_id, item_id)
);
create index rally_eco_inventory_item_idx on public.rally_eco_inventory (item_id);

create table public.rally_eco_holdings (
  registration_id uuid not null references public.registrations (id) on delete cascade,
  asset_id uuid not null references public.rally_eco_assets (id) on delete restrict,
  units integer not null default 0 check (units >= 0),
  primary key (registration_id, asset_id)
);
create index rally_eco_holdings_asset_idx on public.rally_eco_holdings (asset_id);

create table public.rally_eco_event_runs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.rally_eco_events (id) on delete restrict,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  round smallint not null,
  affected integer not null default 0,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);
create index rally_eco_event_runs_event_idx on public.rally_eco_event_runs (event_id);
create index rally_eco_event_runs_competition_idx on public.rally_eco_event_runs (competition_id, created_at desc);
create index rally_eco_event_runs_actor_idx on public.rally_eco_event_runs (actor_id);

-- Append-only, written only by the functions below.
create table public.rally_eco_ledger (
  id bigint generated always as identity primary key,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  amount integer not null,
  kind public.rally_eco_entry_kind not null,
  item_id uuid references public.rally_eco_items (id) on delete set null,
  land_id uuid references public.rally_eco_lands (id) on delete set null,
  asset_id uuid references public.rally_eco_assets (id) on delete set null,
  event_run_id uuid references public.rally_eco_event_runs (id) on delete set null,
  note text not null default '' check (char_length(note) <= 200),
  actor_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);
create index rally_eco_ledger_registration_idx on public.rally_eco_ledger (registration_id, created_at desc);
create index rally_eco_ledger_competition_idx on public.rally_eco_ledger (competition_id, created_at desc);
create index rally_eco_ledger_item_idx on public.rally_eco_ledger (item_id);
create index rally_eco_ledger_land_idx on public.rally_eco_ledger (land_id);
create index rally_eco_ledger_asset_idx on public.rally_eco_ledger (asset_id);
create index rally_eco_ledger_event_run_idx on public.rally_eco_ledger (event_run_id);
create index rally_eco_ledger_actor_idx on public.rally_eco_ledger (actor_id);

-- ----- Helpers -----

create or replace function private.is_rally_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('admin', 'lo'));
$$;

create or replace function private.rally_eco_assert_staff()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_rally_staff() then
    raise exception 'Only the committee can do this' using errcode = '42501';
  end if;
end;
$$;

create or replace function private.rally_eco_assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only an admin can do this' using errcode = '42501';
  end if;
end;
$$;

-- The team's competition, after checking the team is accepted and the game is running. Locks the team row so
-- two purchases for one team never both spend the same money.
create or replace function private.rally_eco_lock_team(p_registration_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition uuid;
  v_status public.registration_status;
  v_settings public.rally_eco_settings;
begin
  select r.competition_id, r.status into v_competition, v_status
  from public.registrations r where r.id = p_registration_id for update;
  if not found or v_status <> 'accepted' then
    raise exception 'This team has not been accepted' using errcode = 'P0001';
  end if;
  select * into v_settings from public.rally_eco_settings where competition_id = v_competition;
  if not found or v_settings.started_at is null then
    raise exception 'The economy game has not started' using errcode = 'P0001';
  end if;
  if v_settings.finalized_at is not null then
    raise exception 'The economy game has ended' using errcode = 'P0001';
  end if;
  return v_competition;
end;
$$;

create or replace function private.rally_eco_cash(p_registration_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(amount), 0)::integer from public.rally_eco_ledger where registration_id = p_registration_id;
$$;

-- A base price after the round step (compounded) and the promo.
create or replace function private.rally_eco_price(p_competition_id uuid, p_base integer)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select round(
    p_base * power(1 + s.round_price_step / 100, s.round - 1) * (1 - s.promo_percent / 100)
  )::integer
  from public.rally_eco_settings s
  where s.competition_id = p_competition_id;
$$;

-- Writes one ledger entry and refuses to take a team below 0.
create or replace function private.rally_eco_post(
  p_competition_id uuid, p_registration_id uuid, p_amount integer, p_kind public.rally_eco_entry_kind,
  p_note text default '', p_item_id uuid default null, p_land_id uuid default null, p_asset_id uuid default null,
  p_event_run_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_amount = 0 then
    return;
  end if;
  if p_amount < 0 and private.rally_eco_cash(p_registration_id) + p_amount < 0 then
    raise exception 'Not enough money' using errcode = 'P0001';
  end if;
  insert into public.rally_eco_ledger (
    competition_id, registration_id, amount, kind, item_id, land_id, asset_id, event_run_id, note, actor_id
  )
  values (
    p_competition_id, p_registration_id, p_amount, p_kind, p_item_id, p_land_id, p_asset_id, p_event_run_id,
    coalesce(p_note, ''), (select auth.uid())
  );
end;
$$;

create or replace function private.rally_eco_take_item(p_registration_id uuid, p_item_id uuid, p_quantity integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.rally_eco_inventory
  set quantity = quantity - p_quantity
  where registration_id = p_registration_id and item_id = p_item_id and quantity >= p_quantity;
  return found;
end;
$$;

-- Defense items a team holds, oldest first, to use up in that order.
create or replace function private.rally_eco_defense_count(p_registration_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(inv.quantity), 0)::integer
  from public.rally_eco_inventory inv
  join public.rally_eco_items i on i.id = inv.item_id
  where inv.registration_id = p_registration_id and i.kind = 'defense';
$$;

create or replace function private.rally_eco_use_defense(p_registration_id uuid, p_count integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_left integer := p_count;
  v_row record;
begin
  for v_row in
    select inv.item_id, inv.quantity
    from public.rally_eco_inventory inv
    join public.rally_eco_items i on i.id = inv.item_id
    where inv.registration_id = p_registration_id and i.kind = 'defense' and inv.quantity > 0
    order by i.created_at, i.id
    for update of inv
  loop
    exit when v_left = 0;
    update public.rally_eco_inventory
    set quantity = quantity - least(v_left, v_row.quantity)
    where registration_id = p_registration_id and item_id = v_row.item_id;
    v_left := v_left - least(v_left, v_row.quantity);
  end loop;
  if v_left > 0 then
    raise exception 'Not enough defense items' using errcode = 'P0001';
  end if;
end;
$$;

-- ----- Game control (admin) -----

-- Gives every accepted team its starting cash once and opens the game. Teams accepted later get theirs when
-- this runs again.
create or replace function public.rally_eco_start(p_competition_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings public.rally_eco_settings;
  v_count integer := 0;
  v_team uuid;
begin
  perform private.rally_eco_assert_admin();
  insert into public.rally_eco_settings (competition_id) values (p_competition_id) on conflict do nothing;
  update public.rally_eco_settings set started_at = coalesce(started_at, now()), updated_at = now()
  where competition_id = p_competition_id
  returning * into v_settings;
  if v_settings.finalized_at is not null then
    raise exception 'The economy game has ended' using errcode = 'P0001';
  end if;

  for v_team in
    select r.id from public.registrations r
    where r.competition_id = p_competition_id and r.status = 'accepted'
      and not exists (select 1 from public.rally_eco_ledger l where l.registration_id = r.id and l.kind = 'start')
  loop
    if v_settings.starting_cash > 0 then
      perform private.rally_eco_post(p_competition_id, v_team, v_settings.starting_cash, 'start');
      v_count := v_count + 1;
    end if;
  end loop;
  return v_count;
end;
$$;

-- Runs an event now. Returns how many teams, lands or assets it changed.
create or replace function public.rally_eco_trigger_event(p_event_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.rally_eco_events;
  v_round smallint;
  v_run uuid;
  v_count integer := 0;
  v_team uuid;
  v_cash integer;
begin
  perform private.rally_eco_assert_admin();
  select * into v_event from public.rally_eco_events where id = p_event_id and is_active;
  if not found then
    raise exception 'This event does not exist or is off' using errcode = 'P0001';
  end if;
  select round into v_round from public.rally_eco_settings
  where competition_id = v_event.competition_id and started_at is not null and finalized_at is null;
  if not found then
    raise exception 'The economy game is not running' using errcode = 'P0001';
  end if;

  insert into public.rally_eco_event_runs (event_id, competition_id, round, actor_id)
  values (v_event.id, v_event.competition_id, v_round, (select auth.uid()))
  returning id into v_run;

  if v_event.effect = 'cash' then
    for v_team in
      select r.id from public.registrations r
      where r.competition_id = v_event.competition_id and r.status = 'accepted'
      order by r.id
      for update
    loop
      if v_event.amount < 0 and v_event.defense_needed > 0
         and private.rally_eco_defense_count(v_team) >= v_event.defense_needed then
        perform private.rally_eco_use_defense(v_team, v_event.defense_needed);
        continue;
      end if;
      v_cash := private.rally_eco_cash(v_team);
      -- A loss takes at most what the team has.
      perform private.rally_eco_post(
        v_event.competition_id, v_team, greatest(round(v_event.amount)::integer, -v_cash), 'event',
        v_event.name, p_event_run_id => v_run
      );
      v_count := v_count + 1;
    end loop;
  elsif v_event.effect = 'land_price' then
    update public.rally_eco_lands
    set price = greatest(round(price * (1 + v_event.amount / 100)), 0)::integer
    where competition_id = v_event.competition_id and (v_event.region is null or region = v_event.region);
    get diagnostics v_count = row_count;
  else
    update public.rally_eco_assets
    set price = greatest(round(price * (1 + v_event.amount / 100)), 0)::integer
    where competition_id = v_event.competition_id and (v_event.asset_id is null or id = v_event.asset_id);
    get diagnostics v_count = row_count;
  end if;

  update public.rally_eco_event_runs set affected = v_count where id = v_run;
  return v_count;
end;
$$;

-- Ends the game: every team's land (at the current price) and shares turn into cash. Land keeps its owner, so the
-- map still shows who held what.
create or replace function public.rally_eco_finalize(p_competition_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team uuid;
  v_value integer;
begin
  perform private.rally_eco_assert_admin();
  update public.rally_eco_settings set finalized_at = now(), updated_at = now()
  where competition_id = p_competition_id and started_at is not null and finalized_at is null;
  if not found then
    raise exception 'The economy game is not running' using errcode = 'P0001';
  end if;

  for v_team in
    select r.id from public.registrations r
    where r.competition_id = p_competition_id and r.status = 'accepted'
  loop
    select coalesce(sum(private.rally_eco_price(p_competition_id, l.price)), 0) into v_value
    from public.rally_eco_lands l where l.owner_registration_id = v_team;
    perform private.rally_eco_post(p_competition_id, v_team, v_value, 'final', 'land');

    select coalesce(sum(h.units * a.price), 0) into v_value
    from public.rally_eco_holdings h join public.rally_eco_assets a on a.id = h.asset_id
    where h.registration_id = v_team;
    perform private.rally_eco_post(p_competition_id, v_team, v_value, 'final', 'assets');
    update public.rally_eco_holdings set units = 0 where registration_id = v_team;
  end loop;
end;
$$;

-- ----- Team actions (admin or LO) -----

-- Money from a post, or a manual correction (negative). Never takes a team below 0.
create or replace function public.rally_eco_grant(p_registration_id uuid, p_amount integer, p_note text default '')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition uuid;
begin
  perform private.rally_eco_assert_staff();
  v_competition := private.rally_eco_lock_team(p_registration_id);
  perform private.rally_eco_post(
    v_competition, p_registration_id, p_amount, case when p_amount > 0 then 'reward' else 'adjust' end::public.rally_eco_entry_kind,
    p_note
  );
  return private.rally_eco_cash(p_registration_id);
end;
$$;

create or replace function public.rally_eco_buy_item(p_registration_id uuid, p_item_id uuid, p_quantity integer default 1)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition uuid;
  v_item public.rally_eco_items;
begin
  perform private.rally_eco_assert_staff();
  if p_quantity < 1 then
    raise exception 'Buy at least one' using errcode = 'P0001';
  end if;
  v_competition := private.rally_eco_lock_team(p_registration_id);
  select * into v_item from public.rally_eco_items
  where id = p_item_id and competition_id = v_competition and is_active
  for update;
  if not found then
    raise exception 'This item is not for sale' using errcode = 'P0001';
  end if;
  if v_item.stock is not null and v_item.stock < p_quantity then
    raise exception 'Out of stock' using errcode = 'P0001';
  end if;

  perform private.rally_eco_post(
    v_competition, p_registration_id, -private.rally_eco_price(v_competition, v_item.price) * p_quantity, 'purchase',
    v_item.name, p_item_id => v_item.id
  );
  update public.rally_eco_items set stock = stock - p_quantity where id = v_item.id and stock is not null;
  insert into public.rally_eco_inventory (registration_id, item_id, quantity) values (p_registration_id, v_item.id, p_quantity)
  on conflict (registration_id, item_id) do update set quantity = public.rally_eco_inventory.quantity + excluded.quantity;
  return private.rally_eco_cash(p_registration_id);
end;
$$;

-- Buys land nobody owns.
create or replace function public.rally_eco_buy_land(p_registration_id uuid, p_land_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition uuid;
  v_land public.rally_eco_lands;
begin
  perform private.rally_eco_assert_staff();
  v_competition := private.rally_eco_lock_team(p_registration_id);
  select * into v_land from public.rally_eco_lands where id = p_land_id and competition_id = v_competition for update;
  if not found then
    raise exception 'This land does not exist' using errcode = 'P0001';
  end if;
  if v_land.owner_registration_id is not null then
    raise exception 'This land already has an owner' using errcode = 'P0001';
  end if;

  perform private.rally_eco_post(
    v_competition, p_registration_id, -private.rally_eco_price(v_competition, v_land.price), 'purchase',
    v_land.name, p_land_id => v_land.id
  );
  update public.rally_eco_lands set owner_registration_id = p_registration_id where id = v_land.id;
  return private.rally_eco_cash(p_registration_id);
end;
$$;

-- Buys (p_units > 0) or sells (p_units < 0) shares at the current price. Share prices do not follow the round
-- step or promo; events move them.
create or replace function public.rally_eco_trade_asset(p_registration_id uuid, p_asset_id uuid, p_units integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition uuid;
  v_asset public.rally_eco_assets;
begin
  perform private.rally_eco_assert_staff();
  if p_units = 0 then
    raise exception 'Trade at least one unit' using errcode = 'P0001';
  end if;
  v_competition := private.rally_eco_lock_team(p_registration_id);
  select * into v_asset from public.rally_eco_assets where id = p_asset_id and competition_id = v_competition and is_active;
  if not found then
    raise exception 'This asset is not for sale' using errcode = 'P0001';
  end if;

  if p_units < 0 then
    update public.rally_eco_holdings set units = units + p_units
    where registration_id = p_registration_id and asset_id = v_asset.id and units >= -p_units;
    if not found then
      raise exception 'Not enough shares' using errcode = 'P0001';
    end if;
  else
    insert into public.rally_eco_holdings (registration_id, asset_id, units) values (p_registration_id, v_asset.id, p_units)
    on conflict (registration_id, asset_id) do update set units = public.rally_eco_holdings.units + excluded.units;
  end if;
  perform private.rally_eco_post(
    v_competition, p_registration_id, -v_asset.price * p_units, case when p_units > 0 then 'purchase' else 'sale' end::public.rally_eco_entry_kind,
    v_asset.name, p_asset_id => v_asset.id
  );
  return private.rally_eco_cash(p_registration_id);
end;
$$;

-- Puts one of the team's defense items on its own land.
create or replace function public.rally_eco_shield_land(p_registration_id uuid, p_land_id uuid, p_item_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition uuid;
begin
  perform private.rally_eco_assert_staff();
  v_competition := private.rally_eco_lock_team(p_registration_id);
  if not exists (
    select 1 from public.rally_eco_items where id = p_item_id and competition_id = v_competition and kind = 'defense'
  ) then
    raise exception 'Use a defense item' using errcode = 'P0001';
  end if;
  if not private.rally_eco_take_item(p_registration_id, p_item_id, 1) then
    raise exception 'The team does not have this item' using errcode = 'P0001';
  end if;
  update public.rally_eco_lands set shield = shield + 1
  where id = p_land_id and owner_registration_id = p_registration_id;
  if not found then
    raise exception 'The team does not own this land' using errcode = 'P0001';
  end if;
  return (select shield from public.rally_eco_lands where id = p_land_id);
end;
$$;

-- One attack with one attack item. On land: a shield on it absorbs the attack, otherwise the land changes owner.
-- On cash: one defense item the target holds absorbs it, otherwise the target loses the item's power in cash.
-- Returns 'blocked', 'land_taken' or 'cash_taken'.
create or replace function public.rally_eco_attack(
  p_attacker_id uuid, p_item_id uuid, p_target_id uuid, p_land_id uuid default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition uuid;
  v_item public.rally_eco_items;
  v_land public.rally_eco_lands;
  v_loss integer;
begin
  perform private.rally_eco_assert_staff();
  if p_attacker_id = p_target_id then
    raise exception 'A team cannot attack itself' using errcode = 'P0001';
  end if;
  -- Lock both teams in a fixed order so two attacks between the same teams cannot deadlock.
  v_competition := private.rally_eco_lock_team(least(p_attacker_id, p_target_id));
  if private.rally_eco_lock_team(greatest(p_attacker_id, p_target_id)) <> v_competition then
    raise exception 'Both teams must be in the same competition' using errcode = 'P0001';
  end if;

  select * into v_item from public.rally_eco_items where id = p_item_id and competition_id = v_competition and kind = 'attack';
  if not found then
    raise exception 'Use an attack item' using errcode = 'P0001';
  end if;
  if not private.rally_eco_take_item(p_attacker_id, p_item_id, 1) then
    raise exception 'The team does not have this item' using errcode = 'P0001';
  end if;

  if p_land_id is not null then
    select * into v_land from public.rally_eco_lands where id = p_land_id for update;
    if not found or v_land.owner_registration_id is distinct from p_target_id then
      raise exception 'The target team does not own this land' using errcode = 'P0001';
    end if;
    if v_land.shield > 0 then
      update public.rally_eco_lands set shield = shield - 1 where id = v_land.id;
      return 'blocked';
    end if;
    update public.rally_eco_lands set owner_registration_id = p_attacker_id where id = v_land.id;
    insert into public.rally_eco_ledger (competition_id, registration_id, amount, kind, item_id, land_id, note, actor_id)
    values (v_competition, p_target_id, 0, 'attack', v_item.id, v_land.id, 'land lost', (select auth.uid()));
    return 'land_taken';
  end if;

  if private.rally_eco_defense_count(p_target_id) > 0 then
    perform private.rally_eco_use_defense(p_target_id, 1);
    return 'blocked';
  end if;
  v_loss := least(v_item.power, private.rally_eco_cash(p_target_id));
  perform private.rally_eco_post(v_competition, p_target_id, -v_loss, 'attack', v_item.name, p_item_id => v_item.id);
  return 'cash_taken';
end;
$$;

-- ----- Reads -----

-- What the Tech Space screen shows: rank, team and cash only (no land, items or shares).
create or replace function public.rally_eco_leaderboard(p_competition_id uuid)
returns table (rank bigint, team_name text, cash integer)
language sql
stable
security definer
set search_path = ''
as $$
  select row_number() over (order by c.cash desc, r.team_name), r.team_name, c.cash
  from public.registrations r
  cross join lateral (select private.rally_eco_cash(r.id) as cash) c
  where r.competition_id = p_competition_id and r.status = 'accepted';
$$;

-- The map: every land and its owner's team name.
create or replace function public.rally_eco_map(p_competition_id uuid)
returns table (land_id uuid, name text, region text, map_x smallint, map_y smallint, owner_team text)
language sql
stable
security definer
set search_path = ''
as $$
  select l.id, l.name, l.region, l.map_x, l.map_y, r.team_name
  from public.rally_eco_lands l
  left join public.registrations r on r.id = l.owner_registration_id
  where l.competition_id = p_competition_id
  order by l.name;
$$;

-- Everything a team owns, valued at current prices. Admins and LOs see every team; a member only their own.
create or replace function public.rally_eco_wealth(p_competition_id uuid)
returns table (registration_id uuid, team_name text, cash integer, land_value integer, asset_value integer, total integer)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.team_name, w.cash, w.land_value, w.asset_value, w.cash + w.land_value + w.asset_value
  from public.registrations r
  cross join lateral (
    select
      private.rally_eco_cash(r.id) as cash,
      coalesce((
        select sum(private.rally_eco_price(r.competition_id, l.price)) from public.rally_eco_lands l
        where l.owner_registration_id = r.id
          and not exists (select 1 from public.rally_eco_settings s where s.competition_id = r.competition_id and s.finalized_at is not null)
      ), 0)::integer as land_value,
      coalesce((
        select sum(h.units * a.price) from public.rally_eco_holdings h join public.rally_eco_assets a on a.id = h.asset_id
        where h.registration_id = r.id
      ), 0)::integer as asset_value
  ) w
  where r.competition_id = p_competition_id and r.status = 'accepted'
    and (private.is_rally_staff() or private.is_team_member(r.id))
  order by 6 desc, r.team_name;
$$;

-- Current prices after the round step and promo, for the shop and the teams' phones.
create or replace function public.rally_eco_prices(p_competition_id uuid)
returns table (kind text, id uuid, name text, price integer, stock integer)
language sql
stable
security definer
set search_path = ''
as $$
  select 'item', i.id, i.name, private.rally_eco_price(i.competition_id, i.price), i.stock
  from public.rally_eco_items i
  where i.competition_id = p_competition_id and i.is_active
    and (private.is_rally_staff() or private.is_rally_participant(p_competition_id))
  union all
  select 'land', l.id, l.name, private.rally_eco_price(l.competition_id, l.price), null
  from public.rally_eco_lands l
  where l.competition_id = p_competition_id
    and (private.is_rally_staff() or private.is_rally_participant(p_competition_id))
  union all
  select 'asset', a.id, a.name, a.price, null
  from public.rally_eco_assets a
  where a.competition_id = p_competition_id and a.is_active
    and (private.is_rally_staff() or private.is_rally_participant(p_competition_id));
$$;

-- ----- Row level security -----

alter table public.rally_eco_settings enable row level security;
alter table public.rally_eco_items enable row level security;
alter table public.rally_eco_lands enable row level security;
alter table public.rally_eco_assets enable row level security;
alter table public.rally_eco_events enable row level security;
alter table public.rally_eco_inventory enable row level security;
alter table public.rally_eco_holdings enable row level security;
alter table public.rally_eco_event_runs enable row level security;
alter table public.rally_eco_ledger enable row level security;

create policy "rally_eco_settings: read staff or participant" on public.rally_eco_settings
  for select to authenticated using ((select private.is_rally_staff()) or (select private.is_rally_participant(competition_id)));
create policy "rally_eco_settings: admin insert" on public.rally_eco_settings
  for insert to authenticated with check ((select private.is_admin()));
create policy "rally_eco_settings: admin update" on public.rally_eco_settings
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "rally_eco_items: read staff or participant" on public.rally_eco_items
  for select to authenticated using ((select private.is_rally_staff()) or (select private.is_rally_participant(competition_id)));
create policy "rally_eco_items: admin insert" on public.rally_eco_items
  for insert to authenticated with check ((select private.is_admin()));
create policy "rally_eco_items: admin update" on public.rally_eco_items
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "rally_eco_items: admin delete" on public.rally_eco_items
  for delete to authenticated using ((select private.is_admin()));

create policy "rally_eco_lands: read staff or participant" on public.rally_eco_lands
  for select to authenticated using ((select private.is_rally_staff()) or (select private.is_rally_participant(competition_id)));
create policy "rally_eco_lands: admin insert" on public.rally_eco_lands
  for insert to authenticated with check ((select private.is_admin()));
create policy "rally_eco_lands: admin update" on public.rally_eco_lands
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "rally_eco_lands: admin delete" on public.rally_eco_lands
  for delete to authenticated using ((select private.is_admin()));

create policy "rally_eco_assets: read staff or participant" on public.rally_eco_assets
  for select to authenticated using ((select private.is_rally_staff()) or (select private.is_rally_participant(competition_id)));
create policy "rally_eco_assets: admin insert" on public.rally_eco_assets
  for insert to authenticated with check ((select private.is_admin()));
create policy "rally_eco_assets: admin update" on public.rally_eco_assets
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "rally_eco_assets: admin delete" on public.rally_eco_assets
  for delete to authenticated using ((select private.is_admin()));

-- Events stay hidden from teams until they happen.
create policy "rally_eco_events: admin read" on public.rally_eco_events
  for select to authenticated using ((select private.is_admin()));
create policy "rally_eco_events: admin insert" on public.rally_eco_events
  for insert to authenticated with check ((select private.is_admin()));
create policy "rally_eco_events: admin update" on public.rally_eco_events
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "rally_eco_events: admin delete" on public.rally_eco_events
  for delete to authenticated using ((select private.is_admin()));

create policy "rally_eco_event_runs: admin read" on public.rally_eco_event_runs
  for select to authenticated using ((select private.is_admin()));

create policy "rally_eco_inventory: read staff or own team" on public.rally_eco_inventory
  for select to authenticated using ((select private.is_rally_staff()) or (select private.is_team_member(registration_id)));
create policy "rally_eco_holdings: read staff or own team" on public.rally_eco_holdings
  for select to authenticated using ((select private.is_rally_staff()) or (select private.is_team_member(registration_id)));
create policy "rally_eco_ledger: read staff or own team" on public.rally_eco_ledger
  for select to authenticated using ((select private.is_rally_staff()) or (select private.is_team_member(registration_id)));

-- ----- Grants -----

revoke all on function private.is_rally_staff() from public, anon;
grant execute on function private.is_rally_staff() to authenticated;
revoke all on function private.rally_eco_assert_staff() from public, anon, authenticated;
revoke all on function private.rally_eco_assert_admin() from public, anon, authenticated;
revoke all on function private.rally_eco_lock_team(uuid) from public, anon, authenticated;
revoke all on function private.rally_eco_cash(uuid) from public, anon, authenticated;
revoke all on function private.rally_eco_price(uuid, integer) from public, anon, authenticated;
revoke all on function private.rally_eco_post(uuid, uuid, integer, public.rally_eco_entry_kind, text, uuid, uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function private.rally_eco_take_item(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function private.rally_eco_defense_count(uuid) from public, anon, authenticated;
revoke all on function private.rally_eco_use_defense(uuid, integer) from public, anon, authenticated;

revoke all on function public.rally_eco_start(uuid) from public, anon;
revoke all on function public.rally_eco_trigger_event(uuid) from public, anon;
revoke all on function public.rally_eco_finalize(uuid) from public, anon;
revoke all on function public.rally_eco_grant(uuid, integer, text) from public, anon;
revoke all on function public.rally_eco_buy_item(uuid, uuid, integer) from public, anon;
revoke all on function public.rally_eco_buy_land(uuid, uuid) from public, anon;
revoke all on function public.rally_eco_trade_asset(uuid, uuid, integer) from public, anon;
revoke all on function public.rally_eco_shield_land(uuid, uuid, uuid) from public, anon;
revoke all on function public.rally_eco_attack(uuid, uuid, uuid, uuid) from public, anon;
revoke all on function public.rally_eco_wealth(uuid) from public, anon;
revoke all on function public.rally_eco_prices(uuid) from public, anon;
grant execute on function public.rally_eco_start(uuid) to authenticated;
grant execute on function public.rally_eco_trigger_event(uuid) to authenticated;
grant execute on function public.rally_eco_finalize(uuid) to authenticated;
grant execute on function public.rally_eco_grant(uuid, integer, text) to authenticated;
grant execute on function public.rally_eco_buy_item(uuid, uuid, integer) to authenticated;
grant execute on function public.rally_eco_buy_land(uuid, uuid) to authenticated;
grant execute on function public.rally_eco_trade_asset(uuid, uuid, integer) to authenticated;
grant execute on function public.rally_eco_shield_land(uuid, uuid, uuid) to authenticated;
grant execute on function public.rally_eco_attack(uuid, uuid, uuid, uuid) to authenticated;
grant execute on function public.rally_eco_wealth(uuid) to authenticated;
grant execute on function public.rally_eco_prices(uuid) to authenticated;
-- The Tech Space screen may run without a login.
grant execute on function public.rally_eco_leaderboard(uuid) to anon, authenticated;
grant execute on function public.rally_eco_map(uuid) to anon, authenticated;

-- Live leaderboard and map on the Tech Space screen.
alter publication supabase_realtime add table public.rally_eco_ledger, public.rally_eco_lands;
