-- Additive analytics upgrade. Existing visits, booking clicks and RLS are preserved.
alter table public.workshop_site_events
  add column if not exists session_id uuid,
  add column if not exists source text,
  add column if not exists referrer_host text,
  add column if not exists medium text,
  add column if not exists campaign text,
  add column if not exists content text,
  add column if not exists device text,
  add column if not exists page text;
alter table public.workshop_site_events drop constraint workshop_site_events_kind_check;
alter table public.workshop_site_events add constraint workshop_site_events_kind_check check(kind in ('visit','booking','action'));
create index if not exists workshop_site_events_visitor_time on public.workshop_site_events(visitor_hash,created_at);
create index if not exists workshop_site_events_time on public.workshop_site_events(created_at);

create or replace function public.workshop_analytics(p_days integer default 30,p_page integer default 1,p_visitor text default null)
returns jsonb language sql stable security invoker set search_path = '' as $$
with bounds as (
 select (now() at time zone 'Asia/Seoul')::date as today,
 ((now() at time zone 'Asia/Seoul')::date - (least(greatest(p_days,1),90)-1))::timestamp at time zone 'Asia/Seoul' as start_at
), all_visitors as (
 select visitor_hash,min(created_at) as first_at,max(created_at) as last_at,
 count(*) as lifetime_views,count(distinct day) as lifetime_days
 from public.workshop_site_events where kind='visit' group by visitor_hash
), events as (
 select e.* from public.workshop_site_events e,bounds b where e.created_at>=b.start_at
), visitors as (
 select e.visitor_hash,min(e.created_at) as period_first,max(e.created_at) as period_last,
 count(*) as views,count(distinct coalesce(e.session_id::text,e.day::text)) as sessions,
 count(distinct e.day) as days,
 (array_agg(coalesce(e.source,'unrecorded') order by e.created_at desc))[1] as source,
 (array_agg(coalesce(e.device,'unknown') order by e.created_at desc))[1] as device
 from events e where kind='visit' group by e.visitor_hash
), metrics as (
 select count(*) as visitors,
 count(*) filter(where a.first_at>=b.start_at) as new_visitors,
 count(*) filter(where a.first_at<b.start_at or v.sessions>1) as returning_visitors,
 coalesce(sum(v.views),0) as views,coalesce(sum(v.sessions),0) as sessions
 from visitors v join all_visitors a using(visitor_hash) cross join bounds b
), sources as (
 select coalesce(source,'unrecorded') as name,count(*) filter(where kind='visit') as views,
 count(distinct visitor_hash) filter(where kind='visit') as visitors,
 count(*) filter(where kind='booking') as bookings,
 count(distinct visitor_hash) filter(where kind='booking') as booking_visitors
 from events group by coalesce(source,'unrecorded')
), campaigns as (
 select coalesce(source,'unrecorded') as source,coalesce(medium,'') as medium,coalesce(campaign,'') as campaign,coalesce(content,'') as content,
 count(*) filter(where kind='visit') as views,count(*) filter(where kind='booking') as bookings
 from events where campaign is not null and campaign<>''
 group by source,medium,campaign,content order by views desc limit 30
), actions as (
 select position as name,count(*) as events,count(distinct visitor_hash) as visitors
 from events where kind='action' group by position order by events desc
), devices as (
 select coalesce(device,'unknown') as name,count(distinct visitor_hash) as visitors from events where kind='visit' group by device
), calendar as (
 select d::date as day from bounds b,generate_series(b.start_at at time zone 'Asia/Seoul',b.today::timestamp,interval '1 day') d
), daily as (
 select c.day,count(e.id) filter(where e.kind='visit') as views,
 count(distinct e.visitor_hash) filter(where e.kind='visit') as visitors,
 count(e.id) filter(where e.kind='booking') as bookings
 from calendar c left join events e on e.day=c.day group by c.day order by c.day
), browser_page as (
 select substring(v.visitor_hash,1,12) as code,v.visitor_hash as key,a.first_at,a.last_at,a.lifetime_views,a.lifetime_days,
 v.views,v.sessions,v.days,v.source,v.device,
 (select count(*) from events e where e.visitor_hash=v.visitor_hash and e.kind='booking') as bookings
 from visitors v join all_visitors a using(visitor_hash)
 order by v.period_last desc limit 20 offset ((least(greatest(p_page,1),10000)-1)*20)
), timeline as (
 select created_at,kind,position,source,medium,campaign,content,device,page,
 substring(session_id::text,1,8) as session
 from events where visitor_hash=p_visitor order by created_at desc limit 100
)
select jsonb_build_object(
 'days',least(greatest(p_days,1),90),'today',(select today from bounds),'start',(select start_at from bounds),
 'metrics',(select to_jsonb(m)||jsonb_build_object('bookings',(select count(*) from events where kind='booking'),'bookingVisitors',(select count(distinct visitor_hash) from events where kind='booking')) from metrics m),
 'sources',coalesce((select jsonb_agg(to_jsonb(s) order by s.visitors desc,s.name) from sources s),'[]'::jsonb),
 'campaigns',coalesce((select jsonb_agg(to_jsonb(c)) from campaigns c),'[]'::jsonb),
 'actions',coalesce((select jsonb_agg(to_jsonb(a)) from actions a),'[]'::jsonb),
 'devices',coalesce((select jsonb_agg(to_jsonb(d)) from devices d),'[]'::jsonb),
 'daily',coalesce((select jsonb_agg(to_jsonb(d) order by d.day) from daily d),'[]'::jsonb),
 'browsers',coalesce((select jsonb_agg(to_jsonb(v)) from browser_page v),'[]'::jsonb),
 'total',(select count(*) from visitors),'page',greatest(p_page,1),
 'pages',greatest(1,ceil((select count(*) from visitors)/20.0)),
 'timeline',coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from timeline t),'[]'::jsonb),
 'trackingStartedAt',(select min(created_at) from public.workshop_site_events where source is not null)
);
$$;
revoke all on function public.workshop_analytics(integer,integer,text) from public,anon,authenticated;
grant execute on function public.workshop_analytics(integer,integer,text) to service_role;
