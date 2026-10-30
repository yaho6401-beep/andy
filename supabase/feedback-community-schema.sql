alter table public.workshop_feedback drop constraint workshop_feedback_animal_check;
alter table public.workshop_feedback add constraint workshop_feedback_animal_check check (animal in ('rat','ox','tiger','bunny','dragon','snake','horse','goat','monkey','rooster','dog','pig','bear','cat','fox'));

create table public.workshop_feedback_settings (
  id boolean primary key default true check (id),
  posting_open boolean not null default true,
  comments_open boolean not null default true,
  likes_open boolean not null default true
);
insert into public.workshop_feedback_settings(id) values(true);
create table public.workshop_feedback_comments (
  id uuid primary key,
  feedback_id uuid not null references public.workshop_feedback(id) on delete cascade,
  nickname text not null check(char_length(nickname) between 1 and 20),
  body text not null check(char_length(body) between 1 and 200 and body !~ '[\r\n]'),
  created_at timestamptz not null default now()
);
create index feedback_comments_parent_created on public.workshop_feedback_comments(feedback_id,created_at,id);
create table public.workshop_feedback_hearts (
  feedback_id uuid not null references public.workshop_feedback(id) on delete cascade,
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  primary key(feedback_id,visitor_hash)
);
create table public.workshop_site_events (
  id uuid primary key,
  day date not null default (now() at time zone 'Asia/Seoul')::date,
  visitor_hash text not null,
  kind text not null check(kind in ('visit','booking')),
  position text not null default '',
  created_at timestamptz not null default now()
);
create index workshop_site_events_day_kind on public.workshop_site_events(day,kind,visitor_hash);
alter table public.workshop_feedback_settings enable row level security;
alter table public.workshop_feedback_comments enable row level security;
alter table public.workshop_feedback_hearts enable row level security;
alter table public.workshop_site_events enable row level security;
revoke all on public.workshop_feedback_settings,public.workshop_feedback_comments,public.workshop_feedback_hearts,public.workshop_site_events from anon,authenticated;
grant all on public.workshop_feedback_settings,public.workshop_feedback_comments,public.workshop_feedback_hearts,public.workshop_site_events to service_role;
create policy "Service manages feedback settings" on public.workshop_feedback_settings to service_role using(true) with check(true);
create policy "Service manages comments" on public.workshop_feedback_comments to service_role using(true) with check(true);
create policy "Service manages hearts" on public.workshop_feedback_hearts to service_role using(true) with check(true);
create policy "Service manages visit statistics" on public.workshop_site_events to service_role using(true) with check(true);

create function public.feedback_action_limit(p_key text,p_limit integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
  insert into public.workshop_feedback_limits as limits(rate_key,window_start,count) values(p_key,now(),1)
  on conflict(rate_key) do update set
    count=case when limits.window_start<now()-interval '1 hour' then 1 else limits.count+1 end,
    window_start=case when limits.window_start<now()-interval '1 hour' then now() else limits.window_start end
  returning count into v_count;
  return v_count<=p_limit;
end;$$;

create function public.workshop_feedback_page(p_page integer,p_visitor_hash text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_total integer;v_pages integer;v_page integer;v_items jsonb;v_settings jsonb;
begin
  select count(*) into v_total from public.workshop_feedback where hidden=false;
  v_pages:=greatest(1,ceil(v_total/9.0)::integer);v_page:=least(greatest(1,p_page),v_pages);
  select coalesce(jsonb_agg(row_data order by created_at desc,id desc),'[]'::jsonb) into v_items from (
    select f.created_at,f.id,(to_jsonb(f)-'hidden')||jsonb_build_object(
      'hearts',(select count(*) from public.workshop_feedback_hearts h where h.feedback_id=f.id),
      'liked',exists(select 1 from public.workshop_feedback_hearts h where h.feedback_id=f.id and h.visitor_hash=p_visitor_hash),
      'comments',(select count(*) from public.workshop_feedback_comments c where c.feedback_id=f.id)
    ) as row_data from public.workshop_feedback f where hidden=false order by created_at desc,id desc limit 9 offset (v_page-1)*9
  ) page_rows;
  select to_jsonb(s)-'id' into v_settings from public.workshop_feedback_settings s where id=true;
  return jsonb_build_object('items',v_items,'page',v_page,'pages',v_pages,'total',v_total,'settings',v_settings,'next',null);
end;$$;

create function public.workshop_feedback_heart(p_id uuid,p_visitor_hash text,p_liked boolean) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
  if not exists(select 1 from public.workshop_feedback where id=p_id and hidden=false) then raise exception 'feedback_not_found';end if;
  if not (select likes_open from public.workshop_feedback_settings where id=true) then raise exception 'feedback_closed';end if;
  if p_liked then
    insert into public.workshop_feedback_hearts(feedback_id,visitor_hash) values(p_id,p_visitor_hash) on conflict do nothing;
  else delete from public.workshop_feedback_hearts where feedback_id=p_id and visitor_hash=p_visitor_hash;end if;
  select count(*) into v_count from public.workshop_feedback_hearts where feedback_id=p_id;
  return jsonb_build_object('hearts',v_count,'liked',p_liked);
end;$$;

create function public.workshop_visit_stats() returns jsonb
language sql security invoker set search_path='' as $$
  select jsonb_build_object('date',(now() at time zone 'Asia/Seoul')::date,
    'visitors',count(distinct visitor_hash) filter(where kind='visit'),
    'views',count(*) filter(where kind='visit'),
    'bookingClicks',count(*) filter(where kind='booking'))
  from public.workshop_site_events where day=(now() at time zone 'Asia/Seoul')::date;
$$;

create function public.feedback_require_open() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if tg_table_name='workshop_feedback' and not(select posting_open from public.workshop_feedback_settings where id=true) then raise exception 'feedback_closed';end if;
  if tg_table_name='workshop_feedback_comments' and not(select comments_open from public.workshop_feedback_settings where id=true) then raise exception 'feedback_closed';end if;
  return new;
end;$$;
create trigger workshop_feedback_open before insert on public.workshop_feedback for each row execute function public.feedback_require_open();
create trigger workshop_comments_open before insert on public.workshop_feedback_comments for each row execute function public.feedback_require_open();

revoke all on function public.feedback_action_limit(text,integer),public.workshop_feedback_page(integer,text),public.workshop_feedback_heart(uuid,text,boolean),public.workshop_visit_stats(),public.feedback_require_open() from public,anon,authenticated;
grant execute on function public.feedback_action_limit(text,integer),public.workshop_feedback_page(integer,text),public.workshop_feedback_heart(uuid,text,boolean),public.workshop_visit_stats(),public.feedback_require_open() to service_role;
