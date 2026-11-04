-- Add isolated reading preview storage; preserve all existing rows.
insert into archive_private.rooms(id,state)
values ('camp-reading-preview-v1','{}'::jsonb)
on conflict(id) do nothing;
