create table public.workshop_gallery (
  id uuid primary key,
  nickname text not null check(char_length(nickname) between 1 and 20),
  caption text not null check(char_length(caption) between 1 and 100),
  storage_path text not null unique,
  password_hash text not null,
  salt text not null,
  iterations integer not null default 210000,
  created_at timestamptz not null default now()
);
create index workshop_gallery_recent on public.workshop_gallery(created_at desc,id desc);
alter table public.workshop_gallery enable row level security;
revoke all on public.workshop_gallery from anon,authenticated;
grant all on public.workshop_gallery to service_role;
create policy "Service manages gallery" on public.workshop_gallery to service_role using(true) with check(true);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('perfume-gallery','perfume-gallery',true,3145728,array['image/jpeg']);
