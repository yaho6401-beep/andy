create table public.workshop_feedback (
  id uuid primary key,
  body text not null check (char_length(body) between 1 and 100 and body !~ '[\r\n]'),
  category text not null check (category in ('improvement','request','message')),
  color text not null check (color in ('butter','rose','lavender','sage','sky','peach')),
  animal text not null check (animal in ('bear','bunny','cat','fox')),
  created_at timestamptz not null default now(),
  hidden boolean not null default false
);
create index workshop_feedback_visible_created on public.workshop_feedback (created_at desc, id desc) where hidden=false;
alter table public.workshop_feedback enable row level security;
revoke all on public.workshop_feedback from anon, authenticated;
grant all on public.workshop_feedback to service_role;

create table public.workshop_feedback_limits (
  rate_key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 1
);
alter table public.workshop_feedback_limits enable row level security;
revoke all on public.workshop_feedback_limits from anon, authenticated;
grant all on public.workshop_feedback_limits to service_role;

create function public.submit_workshop_feedback(
  p_id uuid, p_body text, p_category text, p_color text, p_animal text, p_rate_key text
) returns jsonb
language plpgsql security invoker set search_path=''
as $$
declare v_row public.workshop_feedback; v_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_rate_key,0));
  select * into v_row from public.workshop_feedback where id=p_id;
  if found then
    if v_row.body=p_body and v_row.category=p_category and v_row.color=p_color and v_row.animal=p_animal then
      return jsonb_build_object('id',v_row.id,'body',v_row.body,'category',v_row.category,'color',v_row.color,'animal',v_row.animal,'created_at',v_row.created_at);
    end if;
    raise exception 'feedback_conflict';
  end if;
  insert into public.workshop_feedback_limits as limits (rate_key,window_start,count)
  values (p_rate_key,now(),1)
  on conflict (rate_key) do update set
    count=case when limits.window_start < now()-interval '1 hour' then 1 else limits.count+1 end,
    window_start=case when limits.window_start < now()-interval '1 hour' then now() else limits.window_start end
  returning count into v_count;
  if v_count>30 then raise exception 'feedback_rate_limit'; end if;
  insert into public.workshop_feedback (id,body,category,color,animal)
  values (p_id,p_body,p_category,p_color,p_animal) returning * into v_row;
  delete from public.workshop_feedback_limits where window_start<now()-interval '2 days';
  return jsonb_build_object('id',v_row.id,'body',v_row.body,'category',v_row.category,'color',v_row.color,'animal',v_row.animal,'created_at',v_row.created_at);
end;
$$;
revoke all on function public.submit_workshop_feedback(uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_workshop_feedback(uuid,text,text,text,text,text) to service_role;
