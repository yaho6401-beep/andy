create table public.workshop_gallery_contacts (
 photo_id uuid primary key references public.workshop_gallery(id) on delete cascade,
 phone text not null check(phone ~ '^01[0-9]{8,9}$'),
 consent_at timestamptz not null default now()
);
create table public.workshop_gallery_likes (
 photo_id uuid not null references public.workshop_gallery(id) on delete cascade,
 visitor_hash text not null,
 month date not null,
 created_at timestamptz not null default now(),
 primary key(photo_id,visitor_hash,month)
);
create index gallery_likes_month on public.workshop_gallery_likes(month,photo_id);
create table public.workshop_gallery_awards (
 month date primary key,
 photo_id uuid references public.workshop_gallery(id) on delete set null,
 nickname text not null,
 phone_last4 text not null,
 likes integer not null,
 tied integer not null,
 created_at timestamptz not null default now()
);
alter table public.workshop_gallery_contacts enable row level security;
alter table public.workshop_gallery_likes enable row level security;
alter table public.workshop_gallery_awards enable row level security;
revoke all on public.workshop_gallery_contacts,public.workshop_gallery_likes,public.workshop_gallery_awards from anon,authenticated;
grant all on public.workshop_gallery_contacts,public.workshop_gallery_likes,public.workshop_gallery_awards to service_role;
create policy "Service manages event contacts" on public.workshop_gallery_contacts to service_role using(true) with check(true);
create policy "Service manages gallery likes" on public.workshop_gallery_likes to service_role using(true) with check(true);
create policy "Service manages gallery awards" on public.workshop_gallery_awards to service_role using(true) with check(true);

create function public.workshop_gallery_vote(p_id uuid,p_visitor text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare m date:=date_trunc('month',now() at time zone 'Asia/Seoul')::date; liked boolean;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_id::text||p_visitor,0));
 if not exists(select 1 from public.workshop_gallery where id=p_id) then raise exception 'photo missing'; end if;
 delete from public.workshop_gallery_likes where photo_id=p_id and visitor_hash=p_visitor and month=m;
 liked:=not found;
 if liked then insert into public.workshop_gallery_likes(photo_id,visitor_hash,month) values(p_id,p_visitor,m); end if;
 return jsonb_build_object('liked',liked,'likes',(select count(*) from public.workshop_gallery_likes where photo_id=p_id and month=m));
end $$;

create function public.workshop_gallery_event(p_ids uuid[],p_visitor text) returns jsonb
language sql security invoker set search_path='' as $$
 with m as(select date_trunc('month',now() at time zone 'Asia/Seoul')::date as d),
 counts as(select photo_id,count(*)::int as likes from public.workshop_gallery_likes,m where month=m.d group by photo_id),
 ranks as(select g.id,g.nickname,right(c.phone,4) as last4,coalesce(n.likes,0) as likes from public.workshop_gallery g join public.workshop_gallery_contacts c on c.photo_id=g.id left join counts n on n.photo_id=g.id,m where (g.created_at at time zone 'Asia/Seoul')::date>=m.d and (g.created_at at time zone 'Asia/Seoul')::date<(m.d+interval '1 month')::date order by coalesce(n.likes,0) desc,g.created_at asc limit 9)
 select jsonb_build_object('month',(select d from m),'photos',coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'likes',coalesce(n.likes,0),'liked',exists(select 1 from public.workshop_gallery_likes l,m where l.photo_id=g.id and l.visitor_hash=p_visitor and l.month=m.d),'last4',right(c.phone,4))) from public.workshop_gallery g left join counts n on n.photo_id=g.id left join public.workshop_gallery_contacts c on c.photo_id=g.id where g.id=any(p_ids)),'[]'::jsonb),'leaders',coalesce((select jsonb_agg(ranks) from ranks),'[]'::jsonb),'awards',coalesce((select jsonb_agg(a) from (select month,nickname,phone_last4,likes,tied from public.workshop_gallery_awards order by month desc limit 6)a),'[]'::jsonb));
$$;

create function public.workshop_gallery_finalize(p_month date) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare current_month date:=date_trunc('month',now() at time zone 'Asia/Seoul')::date; winner record; highest int; ties int; result jsonb;
begin
 if p_month<>date_trunc('month',p_month)::date or p_month>=current_month then raise exception 'closed month required'; end if;
 perform pg_advisory_xact_lock(hashtextextended('gallery-award-'||p_month::text,0));
 select to_jsonb(a) into result from public.workshop_gallery_awards a where month=p_month;
 if result is not null then return result; end if;
 with ranked as(select g.id,g.nickname,c.phone,count(l.photo_id)::int as likes from public.workshop_gallery g join public.workshop_gallery_contacts c on c.photo_id=g.id left join public.workshop_gallery_likes l on l.photo_id=g.id and l.month=p_month where (g.created_at at time zone 'Asia/Seoul')::date>=p_month and (g.created_at at time zone 'Asia/Seoul')::date<(p_month+interval '1 month')::date group by g.id,c.phone)
 select max(likes) into highest from ranked;
 if highest is null or highest=0 then raise exception 'no eligible liked photos'; end if;
 with ranked as(select g.id,g.nickname,c.phone,count(l.photo_id)::int as likes from public.workshop_gallery g join public.workshop_gallery_contacts c on c.photo_id=g.id left join public.workshop_gallery_likes l on l.photo_id=g.id and l.month=p_month where (g.created_at at time zone 'Asia/Seoul')::date>=p_month and (g.created_at at time zone 'Asia/Seoul')::date<(p_month+interval '1 month')::date group by g.id,c.phone)
 select *,count(*) over() as tied_count into winner from ranked where likes=highest order by random() limit 1;
 insert into public.workshop_gallery_awards(month,photo_id,nickname,phone_last4,likes,tied) values(p_month,winner.id,winner.nickname,right(winner.phone,4),highest,winner.tied_count) returning to_jsonb(workshop_gallery_awards) into result;
 return result;
end $$;
revoke all on function public.workshop_gallery_vote(uuid,text),public.workshop_gallery_event(uuid[],text),public.workshop_gallery_finalize(date) from public,anon,authenticated;
grant execute on function public.workshop_gallery_vote(uuid,text),public.workshop_gallery_event(uuid[],text),public.workshop_gallery_finalize(date) to service_role;
