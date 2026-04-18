-- Codex workspace persistence tables
create table if not exists codex_threads (
  id text primary key,
  user_id text not null,
  title text not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  message_count integer not null default 0
);

create index if not exists codex_threads_user_updated_idx
  on codex_threads(user_id, updated_at desc);

create table if not exists codex_messages (
  id text primary key,
  thread_id text not null references codex_threads(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('system', 'user', 'assistant')),
  content text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists codex_messages_thread_created_idx
  on codex_messages(thread_id, created_at asc);

create index if not exists codex_messages_user_created_idx
  on codex_messages(user_id, created_at desc);

create table if not exists codex_autonomy_runs (
  id text primary key,
  user_id text not null,
  status text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists codex_autonomy_runs_user_updated_idx
  on codex_autonomy_runs(user_id, updated_at desc);
