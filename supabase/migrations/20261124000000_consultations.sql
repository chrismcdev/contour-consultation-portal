create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 80 and first_name ~ '[^[:space:]]'),
  last_name text not null check (char_length(last_name) between 1 and 80 and last_name ~ '[^[:space:]]'),
  subject text not null check (char_length(subject) between 1 and 160 and subject ~ '[^[:space:]]'),
  campus text not null check (char_length(campus) between 1 and 160 and campus ~ '[^[:space:]]'),
  reason text not null check (char_length(reason) between 1 and 1000 and reason ~ '[^[:space:]]'),
  scheduled_at timestamptz not null check (isfinite(scheduled_at)),
  is_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create index consultations_student_schedule_idx on public.consultations (student_id, scheduled_at, id);
create index consultations_schedule_idx on public.consultations (scheduled_at, id);

create schema if not exists private;
create function private.require_future_schedule()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.scheduled_at <= statement_timestamp() then
    raise check_violation using message = 'Choose a future consultation time.';
  end if;
  return new;
end;
$$;

create trigger consultations_require_future_schedule
before insert or update of scheduled_at on public.consultations
for each row execute function private.require_future_schedule();

alter table public.admin_users enable row level security;
alter table public.consultations enable row level security;

revoke all privileges on public.admin_users, public.consultations from public, anon, authenticated;
grant select on public.admin_users to authenticated;
grant select, delete on public.consultations to authenticated;
grant insert (first_name, last_name, subject, campus, reason, scheduled_at) on public.consultations to authenticated;
grant update (is_complete, scheduled_at) on public.consultations to authenticated;

create policy "Read own admin membership" on public.admin_users
for select to authenticated using (user_id = (select auth.uid()));

create policy "Read consultations as owner or admin" on public.consultations
for select to authenticated using (
  student_id = (select auth.uid())
  or exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

create policy "Book own consultations" on public.consultations
for insert to authenticated with check (student_id = (select auth.uid()));

create policy "Update own consultations" on public.consultations
for update to authenticated using (student_id = (select auth.uid()))
with check (student_id = (select auth.uid()));

create policy "Cancel own consultations" on public.consultations
for delete to authenticated using (student_id = (select auth.uid()));
