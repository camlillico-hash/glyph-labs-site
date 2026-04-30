-- CRM/Codex hardening for Supabase Security Advisor
-- Run this in the Supabase SQL editor against the same database used by the app.
--
-- Why this is safe:
-- - The CRM app accesses Postgres directly from the Next.js server via DATABASE_URL.
-- - It does not rely on PostgREST / client-side Supabase table access for these tables.
-- - Enabling RLS and revoking anon/authenticated access closes the public exposure path
--   without changing server-side access patterns.
--
-- If you later decide to query these tables directly from Supabase client SDKs,
-- you will need to add explicit RLS policies first.

begin;

revoke usage on schema public from anon, authenticated;

alter table if exists public.crm_accounts enable row level security;
alter table if exists public.crm_account_users enable row level security;
alter table if exists public.crm_users enable row level security;
alter table if exists public.crm_deals enable row level security;
alter table if exists public.crm_deal_stamps enable row level security;
alter table if exists public.crm_activities enable row level security;
alter table if exists public.crm_meta enable row level security;
alter table if exists public.crm_contacts enable row level security;
alter table if exists public.crm_tasks enable row level security;
alter table if exists public.crm_contact_stamps enable row level security;
alter table if exists public.codex_threads enable row level security;
alter table if exists public.codex_messages enable row level security;
alter table if exists public.codex_autonomy_runs enable row level security;

alter table if exists public.crm_accounts force row level security;
alter table if exists public.crm_account_users force row level security;
alter table if exists public.crm_users force row level security;
alter table if exists public.crm_deals force row level security;
alter table if exists public.crm_deal_stamps force row level security;
alter table if exists public.crm_activities force row level security;
alter table if exists public.crm_meta force row level security;
alter table if exists public.crm_contacts force row level security;
alter table if exists public.crm_tasks force row level security;
alter table if exists public.crm_contact_stamps force row level security;
alter table if exists public.codex_threads force row level security;
alter table if exists public.codex_messages force row level security;
alter table if exists public.codex_autonomy_runs force row level security;

revoke all on table public.crm_accounts from anon, authenticated;
revoke all on table public.crm_account_users from anon, authenticated;
revoke all on table public.crm_users from anon, authenticated;
revoke all on table public.crm_deals from anon, authenticated;
revoke all on table public.crm_deal_stamps from anon, authenticated;
revoke all on table public.crm_activities from anon, authenticated;
revoke all on table public.crm_meta from anon, authenticated;
revoke all on table public.crm_contacts from anon, authenticated;
revoke all on table public.crm_tasks from anon, authenticated;
revoke all on table public.crm_contact_stamps from anon, authenticated;
revoke all on table public.codex_threads from anon, authenticated;
revoke all on table public.codex_messages from anon, authenticated;
revoke all on table public.codex_autonomy_runs from anon, authenticated;

commit;
