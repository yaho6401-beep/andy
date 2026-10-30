create table public.workshop_scent_staff (
  scent_id text not null check(scent_id ~ '^main-([1-9]|[1-6][0-9]|7[0-2])$'),
  role text not null check(role in ('owner','manager')),
  body text not null check(char_length(body) between 1 and 500),
  updated_at timestamptz not null default now(),
  primary key(scent_id,role)
);
create table public.workshop_scent_reviews (
  id uuid primary key,
  scent_id text not null check(scent_id ~ '^main-([1-9]|[1-6][0-9]|7[0-2])$'),
  nickname text not null check(char_length(nickname) between 1 and 20),
  body text not null check(char_length(body) between 1 and 300),
  password_hash text not null,salt text not null,iterations integer not null default 210000,
  created_at timestamptz not null default now()
);
create index workshop_scent_reviews_recent on public.workshop_scent_reviews(scent_id,created_at desc,id desc);
create table public.workshop_scent_likes (
  scent_id text not null check(scent_id ~ '^main-([1-9]|[1-6][0-9]|7[0-2])$'),
  target text not null check(target in ('scent','owner','manager')),
  visitor_hash text not null,
  primary key(scent_id,target,visitor_hash)
);
alter table public.workshop_scent_staff enable row level security;
alter table public.workshop_scent_reviews enable row level security;
alter table public.workshop_scent_likes enable row level security;
revoke all on public.workshop_scent_staff,public.workshop_scent_reviews,public.workshop_scent_likes from anon,authenticated;
grant all on public.workshop_scent_staff,public.workshop_scent_reviews,public.workshop_scent_likes to service_role;
create policy "Service manages scent staff" on public.workshop_scent_staff to service_role using(true) with check(true);
create policy "Service manages scent reviews" on public.workshop_scent_reviews to service_role using(true) with check(true);
create policy "Service manages scent likes" on public.workshop_scent_likes to service_role using(true) with check(true);

create function public.workshop_scent_page(p_scent text,p_visitor_hash text,p_page integer default 1) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_total bigint;v_page integer;v_pages integer;v_staff jsonb;v_reviews jsonb;v_settings jsonb;
begin
  if p_scent !~ '^main-([1-9]|[1-6][0-9]|7[0-2])$' or p_page<1 or p_page>10000 then raise exception 'invalid_input';end if;
  select count(*) into v_total from public.workshop_scent_reviews where scent_id=p_scent;
  v_pages:=greatest(1,ceil(v_total/9.0)::integer);v_page:=least(p_page,v_pages);
  select coalesce(jsonb_agg(jsonb_build_object('role',s.role,'body',s.body,'updated_at',s.updated_at,
    'likes',(select count(*) from public.workshop_scent_likes l where l.scent_id=p_scent and l.target=s.role),
    'liked',exists(select 1 from public.workshop_scent_likes l where l.scent_id=p_scent and l.target=s.role and l.visitor_hash=p_visitor_hash)) order by s.role desc),'[]'::jsonb)
    into v_staff from public.workshop_scent_staff s where s.scent_id=p_scent;
  select coalesce(jsonb_agg(to_jsonb(r) order by r.created_at desc,r.id desc),'[]'::jsonb) into v_reviews from (
    select id,nickname,body,created_at from public.workshop_scent_reviews where scent_id=p_scent order by created_at desc,id desc limit 9 offset (v_page-1)*9
  ) r;
  select jsonb_build_object('comments_open',comments_open,'likes_open',likes_open) into v_settings from public.workshop_feedback_settings where id=true;
  return jsonb_build_object('staff',v_staff,'reviews',v_reviews,'page',v_page,'pages',v_pages,'total',v_total,'settings',v_settings,
    'likes',(select count(*) from public.workshop_scent_likes where scent_id=p_scent and target='scent'),
    'liked',exists(select 1 from public.workshop_scent_likes where scent_id=p_scent and target='scent' and visitor_hash=p_visitor_hash));
end;$$;

create function public.workshop_scent_like(p_scent text,p_target text,p_visitor_hash text,p_liked boolean) returns jsonb
language plpgsql security invoker set search_path='' as $$
begin
  if p_scent !~ '^main-([1-9]|[1-6][0-9]|7[0-2])$' or p_target not in ('scent','owner','manager') or p_visitor_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid_input';end if;
  perform pg_advisory_xact_lock(hashtextextended(p_scent||':'||p_target,0));
  if not (select likes_open from public.workshop_feedback_settings where id=true) then raise exception 'feedback_closed';end if;
  if p_target<>'scent' and not exists(select 1 from public.workshop_scent_staff where scent_id=p_scent and role=p_target) then raise exception 'staff_not_found';end if;
  if p_liked then insert into public.workshop_scent_likes values(p_scent,p_target,p_visitor_hash) on conflict do nothing;
  else delete from public.workshop_scent_likes where scent_id=p_scent and target=p_target and visitor_hash=p_visitor_hash;end if;
  return jsonb_build_object('likes',(select count(*) from public.workshop_scent_likes where scent_id=p_scent and target=p_target),'liked',p_liked);
end;$$;

create function public.workshop_scent_staff_write(p_scent text,p_role text,p_body text) returns void
language plpgsql security invoker set search_path='' as $$
begin
  if p_scent !~ '^main-([1-9]|[1-6][0-9]|7[0-2])$' or p_role not in ('owner','manager') then raise exception 'invalid_input';end if;
  perform pg_advisory_xact_lock(hashtextextended(p_scent||':'||p_role,0));
  if p_body is null then
    delete from public.workshop_scent_staff where scent_id=p_scent and role=p_role;
    delete from public.workshop_scent_likes where scent_id=p_scent and target=p_role;
  else
    insert into public.workshop_scent_staff(scent_id,role,body) values(p_scent,p_role,p_body)
    on conflict(scent_id,role) do update set body=excluded.body,updated_at=now();
  end if;
end;$$;

create function public.workshop_scent_review_open() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if not(select comments_open from public.workshop_feedback_settings where id=true) then raise exception 'feedback_closed';end if;
  return new;
end;$$;
create trigger workshop_scent_review_open before insert on public.workshop_scent_reviews for each row execute function public.workshop_scent_review_open();
revoke all on function public.workshop_scent_page(text,text,integer),public.workshop_scent_like(text,text,text,boolean),public.workshop_scent_staff_write(text,text,text),public.workshop_scent_review_open() from public,anon,authenticated;
grant execute on function public.workshop_scent_page(text,text,integer),public.workshop_scent_like(text,text,text,boolean),public.workshop_scent_staff_write(text,text,text),public.workshop_scent_review_open() to service_role;
