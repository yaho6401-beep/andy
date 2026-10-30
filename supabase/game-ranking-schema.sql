create table public.workshop_game_players (
 visitor_hash text primary key,
 id uuid not null unique default gen_random_uuid(),
 display_code text not null unique default ('R-'||upper(left(replace(gen_random_uuid()::text,'-',''),8))),
 nickname text not null check(char_length(nickname) between 1 and 12),
 total_score bigint not null default 0 check(total_score>=0),
 score_reached_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index game_players_ranking on public.workshop_game_players(total_score desc,score_reached_at asc,id asc);
alter table public.workshop_game_players enable row level security;
revoke all on public.workshop_game_players from public,anon,authenticated;
grant select,insert,update,delete on public.workshop_game_players to service_role;
create policy "Service manages game players" on public.workshop_game_players to service_role using(true) with check(true);

create function public.workshop_game_register(p_visitor_hash text,p_nickname text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare p public.workshop_game_players; accumulated bigint; reached timestamptz;
begin
 if char_length(p_nickname) not between 1 and 12 then raise exception 'invalid_nickname';end if;
 perform pg_advisory_xact_lock(hashtextextended('runner-player:'||p_visitor_hash,0));
 select * into p from public.workshop_game_players where visitor_hash=p_visitor_hash for update;
 if found then
  update public.workshop_game_players set nickname=p_nickname where visitor_hash=p_visitor_hash returning * into p;
 else
  select coalesce(sum(greatest(0,(state->>'score')::bigint)),0),max(checked_at) into accumulated,reached from public.workshop_game_sessions where visitor_hash=p_visitor_hash;
  insert into public.workshop_game_players(visitor_hash,nickname,total_score,score_reached_at) values(p_visitor_hash,p_nickname,accumulated,coalesce(reached,now())) returning * into p;
 end if;
 return jsonb_build_object('nickname',p.nickname,'totalScore',p.total_score,'code',p.display_code);
end $$;

create function public.workshop_game_accumulate() returns trigger
language plpgsql security invoker set search_path='' as $$
declare gained bigint;
begin
 gained:=greatest(0,coalesce((new.state->>'score')::bigint,0)-coalesce((old.state->>'score')::bigint,0));
 if gained>0 then
  perform pg_advisory_xact_lock(hashtextextended('runner-player:'||new.visitor_hash,0));
  update public.workshop_game_players set total_score=total_score+gained,score_reached_at=now() where visitor_hash=new.visitor_hash;
 end if;
 return new;
end $$;
create trigger accumulate_verified_game_score after update of state on public.workshop_game_sessions for each row execute function public.workshop_game_accumulate();

create function public.workshop_game_leaderboard(p_visitor_hash text) returns jsonb
language sql security invoker set search_path='' as $$
 with ranked as(select visitor_hash,nickname,display_code,total_score,row_number() over(order by total_score desc,score_reached_at asc,id asc) as place from public.workshop_game_players where total_score>0),
 top_players as(select place,nickname,display_code as code,total_score as score from ranked order by place limit 20),
 mine as(select p.nickname,p.display_code as code,p.total_score as score,r.place from public.workshop_game_players p left join ranked r on r.visitor_hash=p.visitor_hash where p.visitor_hash=p_visitor_hash)
 select jsonb_build_object('leaders',coalesce((select jsonb_agg(t order by t.place) from top_players t),'[]'::jsonb),'mine',(select to_jsonb(m) from mine m));
$$;
revoke all on function public.workshop_game_register(text,text),public.workshop_game_accumulate(),public.workshop_game_leaderboard(text) from public,anon,authenticated;
grant execute on function public.workshop_game_register(text,text),public.workshop_game_accumulate(),public.workshop_game_leaderboard(text) to service_role;
