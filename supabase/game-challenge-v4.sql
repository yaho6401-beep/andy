alter table public.workshop_game_players add column challenge_score bigint not null default 0 check(challenge_score>=0);
create index game_players_challenge_ranking on public.workshop_game_players(challenge_score desc,score_reached_at asc,id asc);
create or replace function public.workshop_game_register(p_visitor_hash text,p_nickname text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare p public.workshop_game_players; accumulated bigint; reached timestamptz;
begin
 if char_length(p_nickname) not between 1 and 12 then raise exception 'invalid_nickname';end if;
 perform pg_advisory_xact_lock(hashtextextended('runner-player:'||p_visitor_hash,0));
 select * into p from public.workshop_game_players where visitor_hash=p_visitor_hash for update;
 if found then
  update public.workshop_game_players set nickname=p_nickname where visitor_hash=p_visitor_hash returning * into p;
 else
  select coalesce(max(greatest(0,(state->>'bestScore')::bigint)),0),max(checked_at) into accumulated,reached from public.workshop_game_sessions where visitor_hash=p_visitor_hash and coalesce((state->>'v')::integer,0)>=4;
  insert into public.workshop_game_players(visitor_hash,nickname,challenge_score,score_reached_at) values(p_visitor_hash,p_nickname,accumulated,coalesce(reached,now())) returning * into p;
 end if;
 return jsonb_build_object('nickname',p.nickname,'totalScore',p.challenge_score,'code',p.display_code);
end $$;

create or replace function public.workshop_game_accumulate() returns trigger
language plpgsql security invoker set search_path='' as $$
declare peak bigint;
begin
 if coalesce((new.state->>'v')::integer,0)<4 then return new;end if;
 peak:=greatest(coalesce((new.state->>'bestScore')::bigint,0),coalesce((new.state->>'score')::bigint,0));
 perform pg_advisory_xact_lock(hashtextextended('runner-player:'||new.visitor_hash,0));
 update public.workshop_game_players set challenge_score=peak,score_reached_at=now() where visitor_hash=new.visitor_hash and challenge_score<peak;
 return new;
end $$;
create or replace function public.workshop_game_leaderboard(p_visitor_hash text) returns jsonb
language sql security invoker set search_path='' as $$
 with ranked as(select visitor_hash,nickname,display_code,challenge_score,row_number() over(order by challenge_score desc,score_reached_at asc,id asc) as place from public.workshop_game_players where challenge_score>0),
 top_players as(select place,nickname,display_code as code,challenge_score as score from ranked order by place limit 20),
 mine as(select p.nickname,p.display_code as code,p.challenge_score as score,r.place from public.workshop_game_players p left join ranked r on r.visitor_hash=p.visitor_hash where p.visitor_hash=p_visitor_hash)
 select jsonb_build_object('leaders',coalesce((select jsonb_agg(t order by t.place) from top_players t),'[]'::jsonb),'mine',(select to_jsonb(m) from mine m));
$$;
create or replace function public.workshop_game_claim(p_id uuid,p_visitor_hash text,p_roll integer,p_code text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare s public.workshop_game_sessions;d public.workshop_game_draws;reward text;
begin
 select * into s from public.workshop_game_sessions where id=p_id and visitor_hash=p_visitor_hash for update;
 if not found then raise exception 'game_not_found';end if;
 select * into d from public.workshop_game_draws where session_id=s.id;
 if found then return to_jsonb(d)-'visitor_hash'-'session_id'-'id';end if;
 if s.day<>(now() at time zone 'Asia/Seoul')::date or now()-s.started_at<interval '2 minutes' or coalesce((s.state->>'v')::integer,0)<4 or not coalesce((s.state->>'finished')::boolean,false) or coalesce((s.state->>'active')::integer,0)<7200 or coalesce((s.state->>'score')::integer,0)<500 then raise exception 'game_not_ready';end if;
 if p_roll<0 or p_roll>99 or p_code !~ '^SC-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$' then raise exception 'invalid_draw';end if;
 reward:=case when p_roll<20 then 'discount1000' when p_roll<30 then 'discount2000' when p_roll<35 then 'discount3000' when p_roll<40 then 'extra5' when p_roll<50 then 'extra3' when p_roll<60 then 'bottleUpgrade' else 'none' end;
 insert into public.workshop_game_draws(session_id,visitor_hash,day,prize,code) values(s.id,s.visitor_hash,s.day,reward,case when reward='none' then null else p_code end) returning * into d;
 return to_jsonb(d)-'visitor_hash'-'session_id'-'id';
end;$$;

