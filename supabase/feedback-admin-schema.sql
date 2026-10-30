alter table public.workshop_feedback add column nickname text not null default '향기를 남긴 손님'
  check (char_length(nickname) between 1 and 20 and nickname !~ '[\r\n]');

create table public.workshop_feedback_admin (
  id boolean primary key default true check (id),
  password_hash text not null,
  salt text not null,
  iterations integer not null check (iterations>=210000)
);
create table public.workshop_feedback_sessions (
  token_hash text primary key,
  expires_at timestamptz not null
);
alter table public.workshop_feedback_admin enable row level security;
alter table public.workshop_feedback_sessions enable row level security;
revoke all on public.workshop_feedback_admin,public.workshop_feedback_sessions from anon,authenticated;
grant all on public.workshop_feedback_admin,public.workshop_feedback_sessions to service_role;
create policy "Service manages administrator settings" on public.workshop_feedback_admin to service_role using (true) with check (true);
create policy "Service manages administrator sessions" on public.workshop_feedback_sessions to service_role using (true) with check (true);

create function public.feedback_login_attempt(p_rate_key text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_rate_key,0));
  insert into public.workshop_feedback_limits as limits (rate_key,window_start,count)
  values ('admin:'||p_rate_key,now(),1)
  on conflict (rate_key) do update set
    count=case when limits.window_start < now()-interval '15 minutes' then 1 else limits.count+1 end,
    window_start=case when limits.window_start < now()-interval '15 minutes' then now() else limits.window_start end
  returning count into v_count;
  return v_count<=5;
end;
$$;
revoke all on function public.feedback_login_attempt(text) from public,anon,authenticated;
grant execute on function public.feedback_login_attempt(text) to service_role;

drop function public.submit_workshop_feedback(uuid,text,text,text,text,text);
create function public.submit_workshop_feedback(
  p_id uuid, p_body text, p_category text, p_color text, p_animal text, p_rate_key text,
  p_nickname text default '향기를 남긴 손님'
) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_row public.workshop_feedback; v_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_rate_key,0));
  select * into v_row from public.workshop_feedback where id=p_id;
  if found then
    if v_row.body=p_body and v_row.category=p_category and v_row.color=p_color and v_row.animal=p_animal and v_row.nickname=p_nickname then
      return to_jsonb(v_row)-'hidden';
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
  insert into public.workshop_feedback (id,body,category,color,animal,nickname)
  values (p_id,p_body,p_category,p_color,p_animal,p_nickname) returning * into v_row;
  delete from public.workshop_feedback_limits where window_start<now()-interval '2 days';
  return to_jsonb(v_row)-'hidden';
end;
$$;
revoke all on function public.submit_workshop_feedback(uuid,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_workshop_feedback(uuid,text,text,text,text,text,text) to service_role;
