alter table public.workshop_lounge_applications add column age_group text check (age_group in ('late_teens','early_mid_20s','mid_late_20s','early_mid_30s','mid_late_30s','early_40s'));
alter table public.workshop_lounge_applications alter column consent_version set default 'solo-2026-10-v2';
