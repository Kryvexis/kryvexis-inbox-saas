create extension if not exists pgcrypto;

create table if not exists public.meta_incoming_messages (
  id uuid primary key default gen_random_uuid(),
  wamid text unique,
  phone text not null,
  contact_name text,
  body text not null,
  received_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  consumed boolean not null default false,
  consumed_at timestamptz
);

create index if not exists meta_incoming_messages_consumed_idx
  on public.meta_incoming_messages (consumed, received_at desc);

create index if not exists meta_incoming_messages_phone_idx
  on public.meta_incoming_messages (phone);
