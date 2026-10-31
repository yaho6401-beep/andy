create table public.workshop_scent_accounts (
 id uuid primary key default gen_random_uuid(),
 nickname text not null check(char_length(nickname) between 2 and 20),
 login_key text not null unique,
 password_hash text not null,
 salt text not null,
 created_at timestamptz not null default now()
);
create table public.workshop_scent_sessions (
 token_hash text primary key,
 account_id uuid not null references public.workshop_scent_accounts(id) on delete cascade,
 expires_at timestamptz not null
);
create index scent_session_expiry on public.workshop_scent_sessions(expires_at);
create index scent_session_account on public.workshop_scent_sessions(account_id);
create table public.workshop_scent_records (
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null references public.workshop_scent_accounts(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 60),
 main_id text not null check(main_id ~ '^main-([1-9]|[1-6][0-9]|7[0-2])$'),
 single_ids text[] not null default '{}' check(cardinality(single_ids)<=30),
 sentence text not null default '' check(char_length(sentence)<=400),
 reflection text not null default '' check(char_length(reflection)<=600),
 next_plan text not null default '' check(char_length(next_plan)<=600),
 stage text not null default 'saved' check(stage in ('saved','made','next')),
 staff_note text not null default '' check(char_length(staff_note)<=1000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index scent_records_owner_recent on public.workshop_scent_records(account_id,created_at desc,id desc);
create index scent_records_recent on public.workshop_scent_records(created_at desc,id desc);
alter table public.workshop_scent_accounts enable row level security;
alter table public.workshop_scent_sessions enable row level security;
alter table public.workshop_scent_records enable row level security;
revoke all on public.workshop_scent_accounts,public.workshop_scent_sessions,public.workshop_scent_records from public,anon,authenticated;
grant select,insert,update,delete on public.workshop_scent_accounts,public.workshop_scent_sessions,public.workshop_scent_records to service_role;
create policy "Service manages scent accounts" on public.workshop_scent_accounts to service_role using(true) with check(true);
create policy "Service manages scent sessions" on public.workshop_scent_sessions to service_role using(true) with check(true);
create policy "Service manages scent records" on public.workshop_scent_records to service_role using(true) with check(true);
alter table public.workshop_feedback add column admin_reviewed_at timestamptz;
select cron.schedule('expire-scent-journal-sessions','27 * * * *',
 $$delete from public.workshop_scent_sessions where expires_at<=now()$$);
