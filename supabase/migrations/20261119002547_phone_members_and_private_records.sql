-- Additive membership storage. Existing workshop / archive content is untouched.
create schema if not exists workshop_private;
revoke all on schema workshop_private from public, anon, authenticated;
create table workshop_private.members (
 id uuid primary key default gen_random_uuid(),
 phone text not null unique check(phone ~ '^\+[1-9][0-9]{7,14}$'),
 nickname text not null check(char_length(nickname) between 2 and 16),
 password_hash text not null, salt text not null,
 journal_id uuid not null unique references public.workshop_scent_accounts(id),
 consent_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table workshop_private.member_sessions (
 token_hash text primary key, member_id uuid not null references workshop_private.members(id) on delete cascade,
 expires_at timestamptz not null, created_at timestamptz not null default now()
);
create index member_session_owner on workshop_private.member_sessions(member_id);
create index member_session_expiry on workshop_private.member_sessions(expires_at);
create table workshop_private.member_tickets (
 token_hash text primary key, session_hash text not null references workshop_private.member_sessions(token_hash) on delete cascade,
 expires_at timestamptz not null
);
create index member_ticket_session on workshop_private.member_tickets(session_hash);
create index member_ticket_expiry on workshop_private.member_tickets(expires_at);
create table workshop_private.member_records (
 member_id uuid not null references workshop_private.members(id) on delete cascade,
 kind text not null check(kind in ('reading','blending')), id uuid not null,
 payload jsonb not null check(octet_length(payload::text)<=24000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(member_id,kind,id)
);
create index member_records_recent on workshop_private.member_records(member_id,kind,created_at desc,id desc);
create table workshop_private.member_limits (
 key text primary key, count integer not null default 1, expires_at timestamptz not null
);
create index member_limits_expiry on workshop_private.member_limits(expires_at);
alter table workshop_private.members enable row level security;
alter table workshop_private.member_sessions enable row level security;
alter table workshop_private.member_tickets enable row level security;
alter table workshop_private.member_records enable row level security;
alter table workshop_private.member_limits enable row level security;
revoke all on all tables in schema workshop_private from public, anon, authenticated;
-- No Data API grants or client policies. Only the existing trusted server connection is used.
