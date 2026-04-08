-- ═══════════════════════════════════════════════════════════════════════════════
-- FINANÇAS DUO - Supabase Migrations
-- Copie e cole tudo isso no SQL Editor do Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Create profiles table (extends auth.users) ──────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default now()
);

-- ─── Create transactions table ───────────────────────────────────────────────
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  profile text not null check (profile in ('PF', 'PJ')),
  type text not null check (type in ('income', 'expense', 'transfer')),
  title text not null,
  description text,
  date date not null,
  amount numeric(15,2) not null,
  category text not null,
  subcategory text,
  payment_method text,
  has_receipt boolean default false,
  is_recurring boolean default false,
  tags text array,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ─── Create indexes for better performance ────────────────────────────────────
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(date);
create index idx_transactions_profile on public.transactions(profile);
create index idx_transactions_category on public.transactions(category);

-- ─── Enable RLS (Row Level Security) ─────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

-- ─── RLS Policies for profiles ───────────────────────────────────────────────
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── RLS Policies for transactions ──────────────────────────────────────────
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ─── Trigger to auto-create profile when user signs up ───────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Function to update updated_at timestamp ──────────────────────────────────
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger update_transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.update_updated_at_column();

-- ✅ Migrations complete!
