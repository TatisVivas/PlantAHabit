-- =============================================================
-- Mi Jardín de Hábitos — Esquema de base de datos para Supabase
-- Pega este archivo completo en: Dashboard → SQL Editor → Run
-- Es idempotente: se puede ejecutar más de una vez sin romper nada.
-- =============================================================

-- ---------- Tabla: habits ----------
create table if not exists public.habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 40),
  color         text not null default '#5C7A4F' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  reminder_time time,           -- hora local del recordatorio (opcional), ej. '08:30'
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- Tabla: habit_logs (un registro por hábito y día) ----------
create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid not null references public.habits (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date   date not null,     -- día marcado, en la zona horaria del usuario
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

-- ---------- Índices ----------
create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists habit_logs_habit_id_idx on public.habit_logs (habit_id);
create index if not exists habit_logs_user_date_idx on public.habit_logs (user_id, log_date);

-- ---------- Trigger para mantener updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists habits_set_updated_at on public.habits;
create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- Cada usuario solo ve y modifica SUS hábitos.
drop policy if exists "habits: select own" on public.habits;
create policy "habits: select own"
  on public.habits for select
  using ((select auth.uid()) = user_id);

drop policy if exists "habits: insert own" on public.habits;
create policy "habits: insert own"
  on public.habits for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "habits: update own" on public.habits;
create policy "habits: update own"
  on public.habits for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "habits: delete own" on public.habits;
create policy "habits: delete own"
  on public.habits for delete
  using ((select auth.uid()) = user_id);

-- Cada usuario solo ve y modifica SUS registros diarios.
drop policy if exists "habit_logs: select own" on public.habit_logs;
create policy "habit_logs: select own"
  on public.habit_logs for select
  using ((select auth.uid()) = user_id);

drop policy if exists "habit_logs: insert own" on public.habit_logs;
create policy "habit_logs: insert own"
  on public.habit_logs for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );

drop policy if exists "habit_logs: delete own" on public.habit_logs;
create policy "habit_logs: delete own"
  on public.habit_logs for delete
  using ((select auth.uid()) = user_id);
