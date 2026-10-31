create table public.workshop_staff_accounts(
 slot text primary key check(slot in ('owner','manager1','manager2','manager3','manager4','manager5')),
 display_name text not null check(char_length(display_name) between 1 and 20),
 enabled boolean not null default false,
 password_hash text,salt text,
 updated_at timestamptz not null default now()
);
insert into public.workshop_staff_accounts(slot,display_name,enabled) values ('owner','대표',true),('manager1','매니저',true),('manager2','매니저 2',false),('manager3','매니저 3',false),('manager4','매니저 4',false),('manager5','매니저 5',false);
create table public.workshop_staff_sessions(token_hash text primary key,slot text not null references public.workshop_staff_accounts(slot) on delete cascade,expires_at timestamptz not null);
create index staff_sessions_slot on public.workshop_staff_sessions(slot);
create table public.workshop_staff_comments(
 scent_id text not null check(scent_id ~ '^(main-([1-9]|[1-6][0-9]|7[0-2])|single-(top|middle|base)-(10|[1-9]))$'),
 author_key text not null references public.workshop_staff_accounts(slot),
 body text not null check(char_length(body) between 1 and 500),
 blend_hint text not null default '' check(char_length(blend_hint)<=160),
 tags text[] not null default '{}' check(cardinality(tags)<=3),
 updated_at timestamptz not null default now(),primary key(scent_id,author_key)
);
insert into public.workshop_staff_comments(scent_id,author_key,body,updated_at) select scent_id,case role when 'owner' then 'owner' else 'manager1' end,body,updated_at from public.workshop_scent_staff;
create table public.workshop_staff_comment_likes(scent_id text not null,author_key text not null,visitor_hash text not null,primary key(scent_id,author_key,visitor_hash),foreign key(scent_id,author_key) references public.workshop_staff_comments(scent_id,author_key) on delete cascade);
insert into public.workshop_staff_comment_likes select l.scent_id,case l.target when 'owner' then 'owner' else 'manager1' end,l.visitor_hash from public.workshop_scent_likes l where l.target in ('owner','manager') and exists(select 1 from public.workshop_scent_staff s where s.scent_id=l.scent_id and s.role=l.target);
alter table public.workshop_staff_accounts enable row level security;
alter table public.workshop_staff_sessions enable row level security;
alter table public.workshop_staff_comments enable row level security;
alter table public.workshop_staff_comment_likes enable row level security;
revoke all on public.workshop_staff_accounts,public.workshop_staff_sessions,public.workshop_staff_comments,public.workshop_staff_comment_likes from public,anon,authenticated;
grant select,insert,update,delete on public.workshop_staff_accounts,public.workshop_staff_sessions,public.workshop_staff_comments,public.workshop_staff_comment_likes to service_role;
create policy "Service manages staff accounts" on public.workshop_staff_accounts to service_role using(true) with check(true);
create policy "Service manages staff sessions" on public.workshop_staff_sessions to service_role using(true) with check(true);
create policy "Service manages authored comments" on public.workshop_staff_comments to service_role using(true) with check(true);
create policy "Service manages authored likes" on public.workshop_staff_comment_likes to service_role using(true) with check(true);
create function public.workshop_staff_comment_page(p_scents text[],p_visitor_hash text) returns jsonb
language sql security invoker set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('scent_id',c.scent_id,'author_key',c.author_key,'author_name',a.display_name,'body',c.body,'blend_hint',c.blend_hint,'tags',c.tags,'updated_at',c.updated_at,
 'likes',(select count(*) from public.workshop_staff_comment_likes l where l.scent_id=c.scent_id and l.author_key=c.author_key),
 'liked',exists(select 1 from public.workshop_staff_comment_likes l where l.scent_id=c.scent_id and l.author_key=c.author_key and l.visitor_hash=p_visitor_hash)) order by c.scent_id,c.author_key),'[]'::jsonb)
 from public.workshop_staff_comments c join public.workshop_staff_accounts a on a.slot=c.author_key where c.scent_id=any(p_scents) and a.enabled;
$$;
create function public.workshop_staff_comment_like(p_scent text,p_author text,p_visitor_hash text,p_liked boolean) returns jsonb
language plpgsql security invoker set search_path='' as $$
begin
 if p_visitor_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid_input';end if;
 perform pg_advisory_xact_lock(hashtextextended('staff-like:'||p_scent||':'||p_author,0));
 if not(select likes_open from public.workshop_feedback_settings where id=true) then raise exception 'feedback_closed';end if;
 if not exists(select 1 from public.workshop_staff_comments c join public.workshop_staff_accounts a on a.slot=c.author_key where c.scent_id=p_scent and c.author_key=p_author and a.enabled) then raise exception 'staff_not_found';end if;
 if p_liked then insert into public.workshop_staff_comment_likes values(p_scent,p_author,p_visitor_hash) on conflict do nothing;
 else delete from public.workshop_staff_comment_likes where scent_id=p_scent and author_key=p_author and visitor_hash=p_visitor_hash;end if;
 return jsonb_build_object('liked',p_liked,'likes',(select count(*) from public.workshop_staff_comment_likes where scent_id=p_scent and author_key=p_author));
end;$$;
revoke all on function public.workshop_staff_comment_page(text[],text),public.workshop_staff_comment_like(text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.workshop_staff_comment_page(text[],text),public.workshop_staff_comment_like(text,text,text,boolean) to service_role;
select cron.schedule('expire-staff-comment-sessions','37 * * * *',$$delete from public.workshop_staff_sessions where expires_at<=now()$$);
