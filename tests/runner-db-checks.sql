begin;
do $$
declare s uuid;visitor text;test_code text;d jsonb;again jsonb;counts jsonb;valid boolean;sample text;
begin
 for i in 0..99 loop
  s:=gen_random_uuid();visitor:=md5(s::text)||md5(i::text);test_code:='SC-AAAA-BBBB-'||lpad(upper(to_hex(i)),4,'0');
  insert into public.workshop_game_sessions(id,visitor_hash,state,started_at) values(s,visitor,'{"tick":18000,"active":18000,"score":1000}',now()-interval '301 seconds');
  d:=public.workshop_game_claim(s,visitor,i,test_code);
  again:=public.workshop_game_claim(s,visitor,99,'SC-FFFF-FFFF-FFFF');if d<>again then raise exception 'reroll_allowed';end if;
 end loop;
 select jsonb_object_agg(prize,n) into counts from (select prize,count(*) n from public.workshop_game_draws where code like 'SC-AAAA-BBBB-%' or (prize='none' and visitor_hash in (select visitor_hash from public.workshop_game_sessions where started_at=now()-interval '301 seconds')) group by prize) q;
 if counts<>'{"discount1000":30,"discount2000":20,"discount3000":10,"extra5":5,"extra3":5,"none":30}'::jsonb then raise exception 'incorrect_odds: %',counts;end if;
 select code into sample from public.workshop_game_draws where code='SC-AAAA-BBBB-0000';
 d:=public.workshop_game_redeem(sample,'redeemed');if d->>'status'<>'redeemed' then raise exception 'redeem_failed';end if;
 begin perform public.workshop_game_redeem(sample,'redeemed');raise exception 'double_redeem_allowed';exception when others then if sqlerrm<>'coupon_already_used' then raise;end if;end;
 s:=gen_random_uuid();visitor:=md5(s::text)||md5('clock');
 insert into public.workshop_game_sessions(id,visitor_hash,state) values(s,visitor,'{"tick":0,"active":18000,"score":1000}');
 begin perform public.workshop_game_claim(s,visitor,0,'SC-FFFF-EEEE-DDDD');raise exception 'early_claim_allowed';exception when others then if sqlerrm<>'game_not_ready' then raise;end if;end;
 valid:=public.workshop_game_checkpoint(s,visitor,0,'{"tick":900,"active":18000,"score":1000}');if valid then raise exception 'fast_forward_allowed';end if;
 update public.workshop_game_sessions set started_at=now()-interval '301 seconds',checked_at=now()-interval '12 seconds',state='{"tick":0,"active":0,"score":0}' where id=s;
 valid:=public.workshop_game_checkpoint(s,visitor,0,'{"tick":600,"active":600,"score":10}');if not valid then raise exception 'checkpoint_failed';end if;
 valid:=public.workshop_game_checkpoint(s,visitor,0,'{"tick":601,"active":601,"score":10}');if valid then raise exception 'stale_version_allowed';end if;
 begin perform public.workshop_game_claim(s,visitor,0,'SC-FFFF-EEEE-DDDD');raise exception 'underplayed_claim_allowed';exception when others then if sqlerrm<>'game_not_ready' then raise;end if;end;
 if exists(select 1 from public.workshop_game_draws where code like 'SC-AAAA-BBBB-%' and expires_at<>issued_at+interval '30 days') then raise exception 'wrong_expiry';end if;
end $$;
rollback;
