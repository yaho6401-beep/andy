-- Extend the existing private record store; keep ownership, grants and rows intact.
alter table workshop_private.member_records
  drop constraint member_records_kind_check;
alter table workshop_private.member_records
  add constraint member_records_kind_check
  check (kind in ('reading','blending','notebook'));
