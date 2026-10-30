create table public.workshop_lounge_applications (
 id uuid primary key default gen_random_uuid(),
 receipt text not null unique,
 nickname text not null check(char_length(nickname) between 1 and 20),
 contact_type text not null check(contact_type in ('instagram','phone')),
 contact_value text not null check(char_length(contact_value) between 3 and 40),
 contact_hash text not null unique,
 message text not null default '' check(char_length(message)<=300),
 status text not null default 'pending' check(status in ('pending','contacted','invited','closed')),
 consent_version text not null default 'solo-2026-10-v1',
 consent_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '90 days'
);
create index lounge_applications_recent on public.workshop_lounge_applications(created_at desc,id desc);
create index lounge_applications_expiry on public.workshop_lounge_applications(expires_at);
alter table public.workshop_lounge_applications enable row level security;
revoke all on public.workshop_lounge_applications from public,anon,authenticated;
grant select,insert,update,delete on public.workshop_lounge_applications to service_role;
create policy "Service manages lounge applications" on public.workshop_lounge_applications to service_role using(true) with check(true);
create extension if not exists pg_cron;
select cron.schedule('expire-solo-lounge-applications','17 * * * *',
 $$delete from public.workshop_lounge_applications where expires_at <= now()$$);
