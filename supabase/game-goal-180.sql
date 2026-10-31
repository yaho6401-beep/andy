create or replace function public.workshop_game_claim(p_id uuid,p_visitor_hash text,p_roll integer,p_code text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare s public.workshop_game_sessions;d public.workshop_game_draws;reward text;
begin
 select * into s from public.workshop_game_sessions where id=p_id and visitor_hash=p_visitor_hash for update;
 if not found then raise exception 'game_not_found';end if;
 select * into d from public.workshop_game_draws where session_id=s.id;
 if found then return to_jsonb(d)-'visitor_hash'-'session_id'-'id';end if;
 if s.day<>(now() at time zone 'Asia/Seoul')::date or now()-s.started_at<interval '2 minutes' or coalesce((s.state->>'v')::integer,0)<4 or not coalesce((s.state->>'finished')::boolean,false) or coalesce((s.state->>'active')::integer,0)<7200 or coalesce((s.state->>'score')::integer,0)<180 then raise exception 'game_not_ready';end if;
 if p_roll<0 or p_roll>99 or p_code !~ '^SC-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$' then raise exception 'invalid_draw';end if;
 reward:=case when p_roll<20 then 'discount1000' when p_roll<30 then 'discount2000' when p_roll<35 then 'discount3000' when p_roll<40 then 'extra5' when p_roll<50 then 'extra3' when p_roll<60 then 'bottleUpgrade' else 'none' end;
 insert into public.workshop_game_draws(session_id,visitor_hash,day,prize,code) values(s.id,s.visitor_hash,s.day,reward,case when reward='none' then null else p_code end) returning * into d;
 return to_jsonb(d)-'visitor_hash'-'session_id'-'id';
end;$$;

