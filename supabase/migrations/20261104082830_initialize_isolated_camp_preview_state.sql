-- Preview-only row; never modifies the live community state or its sessions.
insert into archive_private.rooms (id, state)
values ('camp-preview-v2', '{}'::jsonb)
on conflict (id) do nothing;
