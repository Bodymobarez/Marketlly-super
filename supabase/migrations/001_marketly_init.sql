-- Marketly Super Luxury — Postgres schema (Supabase-compatible)
-- Apply in Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

-- ── Listings (prices in BASE_CURRENCY = SAR) ─────────────────────────────────
create table if not exists public.listings (
  id           bigint primary key,
  title        text not null,
  price        numeric(14, 2) not null,
  location     text not null,
  country      text check (country is null or country in ('AE', 'SA', 'KW', 'BH', 'QA', 'OM', 'EG')),
  category     text not null,
  make         text,
  model        text,
  brand        text,
  img          text not null,
  verified     boolean not null default false,
  date_rank    integer not null default 0,
  description  text not null default '',
  status       text not null default 'approved'
               check (status in ('pending', 'approved', 'rejected')),
  owner_id     text,
  owner_name   text,
  vertical     text,
  tags         text[] default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists listings_country_idx on public.listings (country);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_vertical_idx on public.listings (vertical);

-- ── Auth accounts (demo; production should use Supabase Auth) ────────────────
create table if not exists public.accounts (
  id            text primary key,
  name          text not null,
  email         text not null unique,
  password      text not null,
  role          text not null check (role in ('customer', 'dealer', 'admin')),
  banned        boolean not null default false,
  verified      boolean not null default false,
  trade_license text,
  vat_trn       text,
  permissions   jsonb not null default '{}',
  created_at    text not null
);

-- ── Cart lines (keyed by client session id) ──────────────────────────────────
create table if not exists public.cart_lines (
  id             uuid primary key default gen_random_uuid(),
  session_id     text not null,
  ref            text not null,
  provider_id    text not null,
  provider_name  text not null,
  external_id    text not null,
  listing_id     bigint,
  title          text not null,
  price          numeric(14, 2) not null,
  image          text not null,
  vertical       text not null,
  quantity       integer not null default 1,
  updated_at     timestamptz not null default now(),
  unique (session_id, ref)
);

create index if not exists cart_lines_session_idx on public.cart_lines (session_id);

-- ── Auctions ─────────────────────────────────────────────────────────────────
create table if not exists public.auctions (
  id                 text primary key,
  title              text not null,
  category           text not null,
  make               text not null default '',
  model              text not null default '',
  year               integer not null default 2024,
  mileage            integer not null default 0,
  color              text not null default '',
  condition          text not null default 'Excellent',
  transmission       text not null default 'Automatic',
  fuel_type          text not null default 'Petrol',
  body_type          text not null default '',
  vin                text not null default '',
  description        text not null default '',
  images             text[] not null default '{}',
  location           text not null default '',
  starting_price     numeric(14, 2) not null,
  reserve_price      numeric(14, 2) not null,
  min_increment      numeric(14, 2) not null,
  current_bid        numeric(14, 2) not null,
  current_bidder     text,
  current_bidder_id  text,
  bids               jsonb not null default '[]',
  start_time         bigint not null,
  end_time           bigint not null,
  manual_ended       boolean not null default false,
  featured           boolean not null default false,
  seller_id          text not null,
  seller_name        text not null,
  views              integer not null default 0,
  watchers           integer not null default 0,
  updated_at         timestamptz not null default now()
);

-- ── App meta (seed version, etc.) ────────────────────────────────────────────
create table if not exists public.app_meta (
  key   text primary key,
  value jsonb not null default '{}'
);

-- RLS: anon key can read public catalog; writes via anon for demo bootstrap.
-- Tighten for production (service role for seeds, authenticated writes only).
alter table public.listings enable row level security;
alter table public.accounts enable row level security;
alter table public.cart_lines enable row level security;
alter table public.auctions enable row level security;
alter table public.app_meta enable row level security;

do $$ begin
  create policy "listings_public_read" on public.listings for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "listings_public_write" on public.listings for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "accounts_public_all" on public.accounts for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cart_public_all" on public.cart_lines for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "auctions_public_all" on public.auctions for all using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "meta_public_all" on public.app_meta for all using (true) with check (true);
exception when duplicate_object then null; end $$;
