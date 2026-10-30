begin;
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); c uuid:=gen_random_uuid(); m date:=(date_trunc('month',now() at time zone 'Asia/Seoul')-interval '1 month')::date; result jsonb; again jsonb;
begin
 insert into public.workshop_gallery(id,nickname,caption,storage_path,password_hash,salt,created_at) values
 (a,'event-test-a','test',a||'.jpg','hash','salt',m+interval '1 day'),(b,'event-test-b','test',b||'.jpg','hash','salt',m+interval '1 day'),(c,'event-test-c','test',c||'.jpg','hash','salt',m+interval '1 day');
 insert into public.workshop_gallery_contacts(photo_id,phone) values(a,'01012345678'),(b,'01023456789');
 insert into public.workshop_gallery_likes(photo_id,visitor_hash,month) values(a,'test1',m),(a,'test2',m),(b,'test1',m),(b,'test2',m),(c,'test1',m),(c,'test2',m),(c,'test3',m);
 result:=public.workshop_gallery_finalize(m);
 if result->>'photo_id' not in (a::text,b::text) or (result->>'tied')::int<>2 or (result->>'likes')::int<>2 then raise exception 'ranking or tie failure %',result; end if;
 again:=public.workshop_gallery_finalize(m);if again<>result then raise exception 'reroll allowed';end if;
 result:=public.workshop_gallery_event(array[a,b,c],'test1');if result::text like '%01012345678%' or result::text like '%01023456789%' then raise exception 'private phone leaked';end if;
 result:=public.workshop_gallery_vote(a,'vote-test');if not (result->>'liked')::boolean then raise exception 'like failed';end if;
 result:=public.workshop_gallery_vote(a,'vote-test');if (result->>'liked')::boolean then raise exception 'unlike failed';end if;
 if has_table_privilege('anon','public.workshop_gallery_contacts','select') or has_function_privilege('anon','public.workshop_gallery_event(uuid[],text)','execute') then raise exception 'public privilege leak';end if;
 begin perform public.workshop_gallery_finalize(date_trunc('month',now() at time zone 'Asia/Seoul')::date);raise exception 'current month accepted';exception when others then if sqlerrm='current month accepted' then raise;end if;end;
end $$;
rollback;
