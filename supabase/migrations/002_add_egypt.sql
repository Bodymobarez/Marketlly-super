-- Expand market coverage: allow Egypt (EG) on listings.country
alter table public.listings drop constraint if exists listings_country_check;
alter table public.listings
  add constraint listings_country_check
  check (country is null or country in ('AE', 'SA', 'KW', 'BH', 'QA', 'OM', 'EG'));
