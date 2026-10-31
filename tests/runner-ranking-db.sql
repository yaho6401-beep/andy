begin;
do $$
declare v text:='ranking-qa-'||gen_random_uuid(); s1 uuid:=gen_random_uuid(); s2 uuid:=gen_random_uuid(); p jsonb; board jsonb; points bigint; reached timestamptz;
begin
 insert into public.workshop_game_sessions(id,visitor_hash,day,state) values(s1,v,current_date-1,'{"v":2,"score":100,"tick":600}'),(s2,v,current_date,'{"v":2,"score":50,"tick":300}');
 p:=public.workshop_game_register(v,'향기손님');if (p->>'totalScore')::bigint<>0 then raise exception 'legacy total included';end if;
 update public.workshop_game_sessions set state='{"v":3,"bestScore":80,"score":80,"tick":360}' where id=s2;
 select best_score,score_reached_at into points,reached from public.workshop_game_players where visitor_hash=v;if points<>80 then raise exception 'delta accumulation failed';end if;
 update public.workshop_game_sessions set state='{"v":3,"bestScore":80,"score":0,"tick":361}' where id=s2;
 select best_score into points from public.workshop_game_players where visitor_hash=v;if points<>80 then raise exception 'duplicate counted';end if;
 update public.workshop_game_sessions set state='{"v":3,"bestScore":80,"score":60,"tick":400}' where id=s2;select best_score into points from public.workshop_game_players where visitor_hash=v;if points<>80 then raise exception 'scores accumulated across lives';end if;
 p:=public.workshop_game_register(v,'새닉네임');if (p->>'totalScore')::bigint<>80 then raise exception 'rename lost score';end if;
 if (select score_reached_at from public.workshop_game_players where visitor_hash=v)<>reached then raise exception 'rename changed tie order';end if;
 board:=public.workshop_game_leaderboard(v);if board::text like '%'||v||'%' or (board->'mine'->>'score')::bigint<>80 or (board->'mine'->>'place')::bigint<1 then raise exception 'ranking response failed';end if;
 if has_table_privilege('anon','public.workshop_game_players','select') or has_function_privilege('anon','public.workshop_game_register(text,text)','execute') then raise exception 'public write exposure';end if;
end $$;
rollback;
