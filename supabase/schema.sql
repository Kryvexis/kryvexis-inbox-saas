-- Core schema for Kryvexis Inbox SaaS
-- Run this in Supabase SQL editor.

-- Tenants (companies)
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- Profiles (maps Supabase auth user -> tenant + role)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  email text,
  role text not null default 'admin', -- admin | agent
  created_at timestamp with time zone default now()
);

-- Contacts (CRM)
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text,
  phone text,
  email text,
  tags text default '',
  created_at timestamp with time zone default now()
);

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  status text not null default 'open', -- open | pending | closed
  assigned_to uuid references profiles(id) on delete set null,
  subject text,
  last_message_preview text,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  direction text not null, -- inbound | outbound | internal
  body text,
  created_at timestamp with time zone default now()
);

-- Notes (internal)
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  body text not null,
  created_at timestamp with time zone default now()
);

-- Canned replies
create table if not exists canned_replies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamp with time zone default now()
);

-- Automation rules
create table if not exists automation_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  keyword text not null,
  auto_reply text not null,
  enabled boolean default true,
  created_at timestamp with time zone default now()
);

-- Create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- OPTIONAL: RLS policies (simple demo-friendly)
alter table tenants enable row level security;
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notes enable row level security;
alter table canned_replies enable row level security;
alter table automation_rules enable row level security;

-- Profiles can read/update their own profile
create policy "profiles_self_read" on profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on profiles for update using (auth.uid() = id);

-- Tenant access helper: a user's tenant_id
create or replace function public.my_tenant_id()
returns uuid as $$
  select tenant_id from public.profiles where id = auth.uid()
$$ language sql stable;

-- Tenants: user can read only their tenant
create policy "tenants_read_own" on tenants for select using (id = public.my_tenant_id());

-- Contacts/conversations/messages/notes/canned/automation restricted by tenant
create policy "contacts_tenant" on contacts for all using (tenant_id = public.my_tenant_id()) with check (tenant_id = public.my_tenant_id());
create policy "conversations_tenant" on conversations for all using (tenant_id = public.my_tenant_id()) with check (tenant_id = public.my_tenant_id());
create policy "messages_tenant" on messages for all using (tenant_id = public.my_tenant_id()) with check (tenant_id = public.my_tenant_id());
create policy "notes_tenant" on notes for all using (tenant_id = public.my_tenant_id()) with check (tenant_id = public.my_tenant_id());
create policy "canned_tenant" on canned_replies for all using (tenant_id = public.my_tenant_id()) with check (tenant_id = public.my_tenant_id());
create policy "automation_tenant" on automation_rules for all using (tenant_id = public.my_tenant_id()) with check (tenant_id = public.my_tenant_id());

