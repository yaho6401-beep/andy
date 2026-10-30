create table public.workshop_game_sessions (
 id uuid primary key,visitor_hash text not null,day date not null default (now() at time zone 'Asia/Seoul')::date,
 state jsonb not null,version integer not null default 0,started_at timestamptz not null default now(),checked_at timestamptz not null default now(),
 unique(visitor_hash,day)
);
create table public.workshop_game_draws (
 id uuid primary key default gen_random_uuid(),session_id uuid not null unique references public.workshop_game_sessions(id),visitor_hash text not null,day date not null,
 prize text not null check(prize in ('discount1000','discount2000','discount3000','extra5','extra3','none')),
 code text unique,status text not null default 'issued' check(status in ('issued','redeemed','void')),
 issued_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '30 days',redeemed_at timestamptz,
 unique(visitor_hash,day)
);
alter table public.workshop_game_sessions enable row level security;
alter table public.workshop_game_draws enable row level security;
revoke all on public.workshop_game_sessions,public.workshop_game_draws from anon,authenticated;
grant all on public.workshop_game_sessions,public.workshop_game_draws to service_role;
create policy "Service manages game sessions" on public.workshop_game_sessions to service_role using(true) with check(true);
create policy "Service manages game coupons" on public.workshop_game_draws to service_role using(true) with check(true);

create function public.workshop_game_checkpoint(p_id uuid,p_visitor_hash text,p_version integer,p_state jsonb) returns boolean
language plpgsql security invoker set search_path='' as $$
declare s public.workshop_game_sessions;diff integer;
begin
 select * into s from public.workshop_game_sessions where id=p_id and visitor_hash=p_visitor_hash for update;
 if not found or s.version<>p_version or s.day<>(now() at time zone 'Asia/Seoul')::date then return false;end if;
 diff:=(p_state->>'tick')::integer-(s.state->>'tick')::integer;
 if diff<1 or diff>900 or diff/60.0>extract(epoch from now()-s.checked_at)+1 then return false;end if;
 update public.workshop_game_sessions set state=p_state,version=version+1,checked_at=now() where id=p_id;
 return true;
end;$$;

create function public.workshop_game_claim(p_id uuid,p_visitor_hash text,p_roll integer,p_code text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare s public.workshop_game_sessions;d public.workshop_game_draws;reward text;
begin
 select * into s from public.workshop_game_sessions where id=p_id and visitor_hash=p_visitor_hash for update;
 if not found then raise exception 'game_not_found';end if;
 select * into d from public.workshop_game_draws where session_id=s.id;
 if found then return to_jsonb(d)-'visitor_hash'-'session_id'-'id';end if;
 if s.day<>(now() at time zone 'Asia/Seoul')::date or now()-s.started_at<interval '5 minutes' or (s.state->>'active')::integer<18000 or (s.state->>'score')::integer<1000 then raise exception 'game_not_ready';end if;
 if p_roll<0 or p_roll>99 or p_code !~ '^SC-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$' then raise exception 'invalid_draw';end if;
 reward:=case when p_roll<30 then 'discount1000' when p_roll<50 then 'discount2000' when p_roll<60 then 'discount3000' when p_roll<65 then 'extra5' when p_roll<70 then 'extra3' else 'none' end;
 insert into public.workshop_game_draws(session_id,visitor_hash,day,prize,code) values(s.id,s.visitor_hash,s.day,reward,case when reward='none' then null else p_code end) returning * into d;
 return to_jsonb(d)-'visitor_hash'-'session_id'-'id';
end;$$;

create function public.workshop_game_redeem(p_code text,p_action text default 'redeemed') returns jsonb
language plpgsql security invoker set search_path='' as $$
declare d public.workshop_game_draws;
begin
 if p_action not in ('redeemed','void') then raise exception 'invalid_action';end if;
 select * into d from public.workshop_game_draws where code=p_code for update;
 if not found then raise exception 'coupon_not_found';end if;
 if d.status<>'issued' then raise exception 'coupon_already_used';end if;
 if d.expires_at<=now() then raise exception 'coupon_expired';end if;
 update public.workshop_game_draws set status=p_action,redeemed_at=case when p_action='redeemed' then now() else null end where id=d.id returning * into d;
 return to_jsonb(d)-'visitor_hash'-'session_id'-'id';
end;$$;
revoke all on function public.workshop_game_checkpoint(uuid,text,integer,jsonb),public.workshop_game_claim(uuid,text,integer,text),public.workshop_game_redeem(text,text) from public,anon,authenticated;
grant execute on function public.workshop_game_checkpoint(uuid,text,integer,jsonb),public.workshop_game_claim(uuid,text,integer,text),public.workshop_game_redeem(text,text) to service_role;
