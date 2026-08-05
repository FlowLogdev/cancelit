create extension if not exists "uuid-ossp";

create table if not exists public.support_ticket_counters (
  ticket_year integer primary key,
  last_sequence integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text not null unique,
  ticket_year integer not null,
  ticket_sequence integer not null,
  customer_name text not null,
  customer_email text not null,
  issue_type text not null check (
    issue_type in (
      'Billing Information',
      'Cannot Connect Plaid Account',
      'Cannot add subscription Manually',
      'Delete Account Number',
      'Cancel my Subscription',
      'Other'
    )
  ),
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ticket_year, ticket_sequence)
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists support_ticket_counters_updated_at on public.support_ticket_counters;
create trigger support_ticket_counters_updated_at
  before update on public.support_ticket_counters
  for each row execute function public.handle_updated_at();

drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.handle_updated_at();

create or replace function public.create_support_ticket(
  p_customer_name text,
  p_customer_email text,
  p_issue_type text,
  p_message text,
  p_user_id uuid default null
)
returns public.support_tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from timezone('America/New_York', now()))::integer;
  v_sequence integer;
  v_ticket_number text;
  v_ticket public.support_tickets;
begin
  if length(trim(p_customer_name)) < 2 then
    raise exception 'Customer name is required.';
  end if;

  if p_customer_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'A valid customer email is required.';
  end if;

  if p_issue_type not in (
    'Billing Information',
    'Cannot Connect Plaid Account',
    'Cannot add subscription Manually',
    'Delete Account Number',
    'Cancel my Subscription',
    'Other'
  ) then
    raise exception 'Invalid issue title.';
  end if;

  if length(trim(p_message)) < 10 then
    raise exception 'Ticket details are required.';
  end if;

  insert into public.support_ticket_counters (ticket_year, last_sequence)
  values (v_year, 1000)
  on conflict (ticket_year)
  do update
    set last_sequence = public.support_ticket_counters.last_sequence + 1,
        updated_at = now()
  returning last_sequence into v_sequence;

  v_ticket_number := 'Cancel' || v_sequence::text || v_year::text;

  insert into public.support_tickets (
    ticket_number,
    ticket_year,
    ticket_sequence,
    customer_name,
    customer_email,
    issue_type,
    message,
    user_id
  )
  values (
    v_ticket_number,
    v_year,
    v_sequence,
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    p_issue_type,
    trim(p_message),
    p_user_id
  )
  returning * into v_ticket;

  return v_ticket;
end;
$$;

alter table public.support_ticket_counters enable row level security;
alter table public.support_tickets enable row level security;

revoke all on public.support_ticket_counters from anon, authenticated;
revoke all on public.support_tickets from anon, authenticated;
revoke all on function public.create_support_ticket(text, text, text, text, uuid) from public, anon, authenticated;

grant all on public.support_ticket_counters to service_role;
grant all on public.support_tickets to service_role;
grant execute on function public.create_support_ticket(text, text, text, text, uuid) to service_role;

create index if not exists support_tickets_ticket_number_idx on public.support_tickets(ticket_number);
create index if not exists support_tickets_customer_email_idx on public.support_tickets(customer_email);
create index if not exists support_tickets_status_idx on public.support_tickets(status);
create index if not exists support_tickets_created_at_idx on public.support_tickets(created_at desc);
