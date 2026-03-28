-- CRM multi-tenant + user auth migration
-- Run this in Supabase SQL editor (or psql) against DATABASE_URL.
-- Safe to run multiple times where possible.

begin;

-- 1) Users / Accounts
create table if not exists crm_users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists crm_accounts (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists crm_account_users (
  account_id text not null references crm_accounts(id) on delete cascade,
  user_id text not null references crm_users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (account_id, user_id)
);

create index if not exists crm_account_users_user_id_idx on crm_account_users(user_id);

-- 2) Add account_id to existing CRM tables
-- Notes:
-- - We store JSON in data jsonb; account_id is a real column for fast scoping.
-- - Existing rows will be assigned to a placeholder account after you create it.

alter table if exists crm_contacts add column if not exists account_id text;
alter table if exists crm_deals add column if not exists account_id text;
alter table if exists crm_contact_stamps add column if not exists account_id text;
alter table if exists crm_deal_stamps add column if not exists account_id text;
alter table if exists crm_tasks add column if not exists account_id text;
alter table if exists crm_activities add column if not exists account_id text;
alter table if exists crm_meta add column if not exists account_id text;

create index if not exists crm_contacts_account_id_idx on crm_contacts(account_id);
create index if not exists crm_deals_account_id_idx on crm_deals(account_id);
create index if not exists crm_tasks_account_id_idx on crm_tasks(account_id);
create index if not exists crm_activities_account_id_idx on crm_activities(account_id);
create index if not exists crm_meta_account_id_idx on crm_meta(account_id);

-- 3) Optional: add FKs (kept optional because existing code may insert before account exists)
-- You can enable these once the app is fully migrated.
-- alter table crm_contacts add constraint crm_contacts_account_fk foreign key (account_id) references crm_accounts(id);
-- ... etc

commit;

-- After running this:
-- 1) Create an initial account and user via /crm/admin (after code change)
-- 2) If you have legacy data already in the tables, decide which account it belongs to and update:
--    update crm_contacts set account_id='<accountId>' where account_id is null;
--    ...repeat for the other tables.
