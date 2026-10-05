-- Jappy: Online-Speicher für den Lernfortschritt (eine Zeile pro Konto).
-- Im Supabase-Dashboard unter „SQL Editor“ einfügen und ausführen.

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  data jsonb not null,
  rev bigint not null default 1,          -- Versionsnummer gegen gleichzeitiges Überschreiben
  device text,                            -- zuletzt hochgeladen von (Handy/Computer)
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.progress to authenticated;

-- Jede Person sieht und ändert nur ihre eigene Zeile.
alter table public.progress enable row level security;

drop policy if exists "eigener Fortschritt lesen" on public.progress;
drop policy if exists "eigener Fortschritt anlegen" on public.progress;
drop policy if exists "eigener Fortschritt ändern" on public.progress;

create policy "eigener Fortschritt lesen" on public.progress
  for select using (auth.uid() = user_id);
create policy "eigener Fortschritt anlegen" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "eigener Fortschritt ändern" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Konto löschen (Button in den Einstellungen): entfernt Nutzer und Fortschritt.
create or replace function public.delete_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
