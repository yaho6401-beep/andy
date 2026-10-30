alter table public.workshop_feedback add column edited_at timestamptz;
create table public.workshop_feedback_edit_keys (
  feedback_id uuid primary key references public.workshop_feedback(id) on delete cascade,
  password_hash text not null,
  salt text not null,
  iterations integer not null default 210000 check(iterations>=210000)
);
alter table public.workshop_feedback_edit_keys enable row level security;
revoke all on public.workshop_feedback_edit_keys from anon,authenticated;
grant all on public.workshop_feedback_edit_keys to service_role;
create policy "Service manages memo edit keys" on public.workshop_feedback_edit_keys to service_role using(true) with check(true);

create function public.submit_feedback_with_edit(
  p_id uuid,p_body text,p_category text,p_color text,p_animal text,p_rate_key text,p_nickname text,p_hash text,p_salt text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_result jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_id::text,1));
  if exists(select 1 from public.workshop_feedback where id=p_id)
    and not exists(select 1 from public.workshop_feedback_edit_keys where feedback_id=p_id) then
    raise exception 'feedback_conflict';
  end if;
  v_result:=public.submit_workshop_feedback(p_id,p_body,p_category,p_color,p_animal,p_rate_key,p_nickname);
  insert into public.workshop_feedback_edit_keys(feedback_id,password_hash,salt) values(p_id,p_hash,p_salt) on conflict do nothing;
  return v_result||jsonb_build_object('editable',true);
end;$$;
revoke all on function public.submit_feedback_with_edit(uuid,text,text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_feedback_with_edit(uuid,text,text,text,text,text,text,text,text) to service_role;

create or replace function public.workshop_feedback_page(p_page integer,p_visitor_hash text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_total integer;v_pages integer;v_page integer;v_items jsonb;v_settings jsonb;
begin
  select count(*) into v_total from public.workshop_feedback where hidden=false;
  v_pages:=greatest(1,ceil(v_total/9.0)::integer);v_page:=least(greatest(1,p_page),v_pages);
  select coalesce(jsonb_agg(row_data order by created_at desc,id desc),'[]'::jsonb) into v_items from (
    select f.created_at,f.id,(to_jsonb(f)-'hidden')||jsonb_build_object(
      'editable',exists(select 1 from public.workshop_feedback_edit_keys k where k.feedback_id=f.id),
      'hearts',(select count(*) from public.workshop_feedback_hearts h where h.feedback_id=f.id),
      'liked',exists(select 1 from public.workshop_feedback_hearts h where h.feedback_id=f.id and h.visitor_hash=p_visitor_hash),
      'comments',(select count(*) from public.workshop_feedback_comments c where c.feedback_id=f.id)
    ) as row_data from public.workshop_feedback f where hidden=false order by created_at desc,id desc limit 9 offset (v_page-1)*9
  ) page_rows;
  select to_jsonb(s)-'id' into v_settings from public.workshop_feedback_settings s where id=true;
  return jsonb_build_object('items',v_items,'page',v_page,'pages',v_pages,'total',v_total,'settings',v_settings,'next',null);
end;$$;
