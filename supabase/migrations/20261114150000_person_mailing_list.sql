-- Opt-in for the club's mailing list, exported in the "Mailing Liste" tab of the Homepage module.
begin;

alter table public.person add column if not exists "isOnMailingList" boolean not null default false;

commit;
