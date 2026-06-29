create extension if not exists "uuid-ossp";

create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  billing_address jsonb,
  payment_method jsonb,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_tier text default 'free',
  subscription_status text not null default 'free',
  email_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(10,2),
  cost numeric(10,2),
  billing_cycle text not null check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  next_billing_date date not null,
  status text not null default 'active' check (status in ('active', 'cancelled', 'paused', 'expired', 'pending_cancellation')),
  category text,
  description text,
  website_url text,
  logo_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_positive_amount check (coalesce(amount, cost, 0) > 0)
);

create table if not exists public.plaid_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null unique,
  access_token text not null,
  institution_id text,
  institution_name text,
  status text not null default 'active',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plaid_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.plaid_items(item_id) on delete cascade,
  account_id text not null,
  account_name text,
  account_mask text,
  account_type text,
  account_subtype text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, account_id)
);

create table if not exists public.plaid_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id text not null,
  transaction_id text not null unique,
  amount numeric(10,2) not null,
  date date not null,
  name text not null,
  merchant_name text,
  category text[],
  is_subscription boolean not null default false,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cancellation_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  subscription_name text not null,
  status text not null default 'requested' check (status in ('requested', 'in_progress', 'completed', 'customer_action_needed', 'cancelled')),
  cancellation_url text,
  instructions text[] not null default '{}',
  customer_notes text,
  support_notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_subscription_amounts()
returns trigger
language plpgsql
as $$
begin
  if new.amount is null and new.cost is not null then
    new.amount := new.cost;
  end if;

  if new.cost is null and new.amount is not null then
    new.cost := new.amount;
  end if;

  return new;
end;
$$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
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
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = now();

  insert into public.customers (user_id, email, full_name, email_confirmed_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email_confirmed_at
  )
  on conflict (user_id) do update
  set email = excluded.email,
      full_name = coalesce(public.customers.full_name, excluded.full_name),
      email_confirmed_at = excluded.email_confirmed_at,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists subscriptions_sync_amounts on public.subscriptions;
create trigger subscriptions_sync_amounts
  before insert or update on public.subscriptions
  for each row execute function public.sync_subscription_amounts();

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.handle_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists plaid_items_updated_at on public.plaid_items;
create trigger plaid_items_updated_at
  before update on public.plaid_items
  for each row execute function public.handle_updated_at();

drop trigger if exists plaid_accounts_updated_at on public.plaid_accounts;
create trigger plaid_accounts_updated_at
  before update on public.plaid_accounts
  for each row execute function public.handle_updated_at();

drop trigger if exists plaid_transactions_updated_at on public.plaid_transactions;
create trigger plaid_transactions_updated_at
  before update on public.plaid_transactions
  for each row execute function public.handle_updated_at();

drop trigger if exists cancellation_requests_updated_at on public.cancellation_requests;
create trigger cancellation_requests_updated_at
  before update on public.cancellation_requests
  for each row execute function public.handle_updated_at();

alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.profiles enable row level security;
alter table public.plaid_items enable row level security;
alter table public.plaid_accounts enable row level security;
alter table public.plaid_transactions enable row level security;
alter table public.cancellation_requests enable row level security;

drop policy if exists "Customers can read own record" on public.customers;
drop policy if exists "Customers can update own record" on public.customers;
drop policy if exists "Customers can insert own record" on public.customers;
drop policy if exists "Subscriptions belong to user" on public.subscriptions;
drop policy if exists "Profiles belong to user" on public.profiles;
drop policy if exists "Plaid items belong to user" on public.plaid_items;
drop policy if exists "Plaid accounts belong to user" on public.plaid_accounts;
drop policy if exists "Plaid transactions belong to user" on public.plaid_transactions;
drop policy if exists "Cancellation requests belong to user" on public.cancellation_requests;

create policy "Customers can read own record"
  on public.customers for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Customers can update own record"
  on public.customers for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Customers can insert own record"
  on public.customers for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Subscriptions belong to user"
  on public.subscriptions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Profiles belong to user"
  on public.profiles for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Plaid items belong to user"
  on public.plaid_items for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Plaid accounts belong to user"
  on public.plaid_accounts for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Plaid transactions belong to user"
  on public.plaid_transactions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cancellation requests belong to user"
  on public.cancellation_requests for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists customers_user_id_idx on public.customers(user_id);
create index if not exists customers_email_idx on public.customers(email);
create index if not exists customers_stripe_customer_id_idx on public.customers(stripe_customer_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists subscriptions_next_billing_date_idx on public.subscriptions(next_billing_date);
create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists plaid_items_user_id_idx on public.plaid_items(user_id);
create index if not exists plaid_items_item_id_idx on public.plaid_items(item_id);
create index if not exists plaid_accounts_user_id_idx on public.plaid_accounts(user_id);
create index if not exists plaid_transactions_user_id_idx on public.plaid_transactions(user_id);
create index if not exists cancellation_requests_user_id_idx on public.cancellation_requests(user_id);
create index if not exists cancellation_requests_subscription_id_idx on public.cancellation_requests(subscription_id);
create index if not exists cancellation_requests_status_idx on public.cancellation_requests(status);

grant select, insert, update on public.customers to authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.plaid_items to authenticated;
grant select, insert, update, delete on public.plaid_accounts to authenticated;
grant select, insert, update, delete on public.plaid_transactions to authenticated;
grant select, insert, update on public.cancellation_requests to authenticated;

grant all on public.customers to service_role;
grant all on public.subscriptions to service_role;
grant all on public.profiles to service_role;
grant all on public.plaid_items to service_role;
grant all on public.plaid_accounts to service_role;
grant all on public.plaid_transactions to service_role;
grant all on public.cancellation_requests to service_role;

grant usage on all sequences in schema public to authenticated;
grant usage on all sequences in schema public to service_role;
