create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  travelers integer not null default 1 check (travelers > 0),
  budget_total numeric(12, 2) not null default 0 check (budget_total >= 0),
  currency text not null default 'USD',
  status text not null default 'Planning'
    check (status in ('Planning', 'Booked', 'In Progress', 'Completed')),
  summary text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expense_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  category text not null
    check (category in ('Flights', 'Hotels', 'Transport', 'Food', 'Activities', 'Shopping', 'Emergency')),
  label text not null,
  planned_amount numeric(12, 2) not null default 0 check (planned_amount >= 0),
  actual_amount numeric(12, 2) not null default 0 check (actual_amount >= 0),
  due_date date,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  title text not null,
  date date not null,
  start_time time,
  end_time time,
  location text not null default '',
  notes text not null default '',
  type text not null default 'Activity'
    check (type in ('Transit', 'Stay', 'Activity', 'Food', 'Work', 'Buffer')),
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High')),
  cost_estimate numeric(12, 2) not null default 0 check (cost_estimate >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.document_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  type text not null
    check (type in ('Passport', 'Visa', 'Insurance', 'Flight Ticket', 'Hotel Booking', 'Other')),
  title text not null,
  reference_number text not null default '',
  issuer text not null default '',
  valid_until date,
  status text not null default 'Pending'
    check (status in ('Pending', 'Ready', 'Expired')),
  file_url text not null default '',
  file_path text not null default '',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trips_user_id_idx on public.trips (user_id);
create index if not exists expense_items_trip_id_idx on public.expense_items (trip_id);
create index if not exists itinerary_items_trip_id_idx on public.itinerary_items (trip_id);
create index if not exists document_items_trip_id_idx on public.document_items (trip_id);
create index if not exists itinerary_items_date_idx on public.itinerary_items (date);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_trips_updated_at on public.trips;
create trigger set_trips_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

drop trigger if exists set_expense_items_updated_at on public.expense_items;
create trigger set_expense_items_updated_at
before update on public.expense_items
for each row execute function public.set_updated_at();

drop trigger if exists set_itinerary_items_updated_at on public.itinerary_items;
create trigger set_itinerary_items_updated_at
before update on public.itinerary_items
for each row execute function public.set_updated_at();

drop trigger if exists set_document_items_updated_at on public.document_items;
create trigger set_document_items_updated_at
before update on public.document_items
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.expense_items enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.document_items enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Trips are readable by owner" on public.trips;
create policy "Trips are readable by owner"
on public.trips
for select
using (auth.uid() = user_id);

drop policy if exists "Trips are insertable by owner" on public.trips;
create policy "Trips are insertable by owner"
on public.trips
for insert
with check (auth.uid() = user_id);

drop policy if exists "Trips are editable by owner" on public.trips;
create policy "Trips are editable by owner"
on public.trips
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Trips are deletable by owner" on public.trips;
create policy "Trips are deletable by owner"
on public.trips
for delete
using (auth.uid() = user_id);

drop policy if exists "Expense items are readable by trip owner" on public.expense_items;
create policy "Expense items are readable by trip owner"
on public.expense_items
for select
using (
  exists (
    select 1
    from public.trips
    where trips.id = expense_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Expense items are insertable by trip owner" on public.expense_items;
create policy "Expense items are insertable by trip owner"
on public.expense_items
for insert
with check (
  exists (
    select 1
    from public.trips
    where trips.id = expense_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Expense items are editable by trip owner" on public.expense_items;
create policy "Expense items are editable by trip owner"
on public.expense_items
for update
using (
  exists (
    select 1
    from public.trips
    where trips.id = expense_items.trip_id
      and trips.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.trips
    where trips.id = expense_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Expense items are deletable by trip owner" on public.expense_items;
create policy "Expense items are deletable by trip owner"
on public.expense_items
for delete
using (
  exists (
    select 1
    from public.trips
    where trips.id = expense_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Itinerary items are readable by trip owner" on public.itinerary_items;
create policy "Itinerary items are readable by trip owner"
on public.itinerary_items
for select
using (
  exists (
    select 1
    from public.trips
    where trips.id = itinerary_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Itinerary items are insertable by trip owner" on public.itinerary_items;
create policy "Itinerary items are insertable by trip owner"
on public.itinerary_items
for insert
with check (
  exists (
    select 1
    from public.trips
    where trips.id = itinerary_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Itinerary items are editable by trip owner" on public.itinerary_items;
create policy "Itinerary items are editable by trip owner"
on public.itinerary_items
for update
using (
  exists (
    select 1
    from public.trips
    where trips.id = itinerary_items.trip_id
      and trips.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.trips
    where trips.id = itinerary_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Itinerary items are deletable by trip owner" on public.itinerary_items;
create policy "Itinerary items are deletable by trip owner"
on public.itinerary_items
for delete
using (
  exists (
    select 1
    from public.trips
    where trips.id = itinerary_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Document items are readable by trip owner" on public.document_items;
create policy "Document items are readable by trip owner"
on public.document_items
for select
using (
  exists (
    select 1
    from public.trips
    where trips.id = document_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Document items are insertable by trip owner" on public.document_items;
create policy "Document items are insertable by trip owner"
on public.document_items
for insert
with check (
  exists (
    select 1
    from public.trips
    where trips.id = document_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Document items are editable by trip owner" on public.document_items;
create policy "Document items are editable by trip owner"
on public.document_items
for update
using (
  exists (
    select 1
    from public.trips
    where trips.id = document_items.trip_id
      and trips.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.trips
    where trips.id = document_items.trip_id
      and trips.user_id = auth.uid()
  )
);

drop policy if exists "Document items are deletable by trip owner" on public.document_items;
create policy "Document items are deletable by trip owner"
on public.document_items
for delete
using (
  exists (
    select 1
    from public.trips
    where trips.id = document_items.trip_id
      and trips.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('travel-documents', 'travel-documents', true)
on conflict (id) do nothing;

drop policy if exists "Travel document files are public" on storage.objects;
create policy "Travel document files are public"
on storage.objects
for select
to public
using (bucket_id = 'travel-documents');

drop policy if exists "Users can upload their own travel files" on storage.objects;
create policy "Users can upload their own travel files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'travel-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update their own travel files" on storage.objects;
create policy "Users can update their own travel files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'travel-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'travel-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete their own travel files" on storage.objects;
create policy "Users can delete their own travel files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'travel-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);
