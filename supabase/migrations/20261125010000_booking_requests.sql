create table private.booking_requests (
  student_id uuid not null references auth.users (id) on delete cascade,
  request_id uuid not null,
  consultation_id uuid not null,
  fingerprint bytea not null,
  primary key (student_id, request_id)
);

alter table private.booking_requests enable row level security;
revoke all on private.booking_requests from public, anon, authenticated;
grant usage on schema private to authenticated;
grant select, insert on private.booking_requests to authenticated;
create policy "Read own booking requests" on private.booking_requests
for select to authenticated using (student_id = (select auth.uid()));
create policy "Record own booking requests" on private.booking_requests
for insert to authenticated with check (
  student_id = (select auth.uid()) and exists (
    select 1 from public.consultations c
    where c.id = consultation_id and c.student_id = (select auth.uid())
  )
);

create function public.book_consultation_once(request_id uuid, details jsonb, allow_create boolean)
returns setof public.consultations
language plpgsql security invoker set search_path = '' set timezone = 'UTC'
as $$
declare
  owner_id uuid := auth.uid();
  requested public.consultations := jsonb_populate_record(null::public.consultations, details);
  fingerprint bytea := sha256(convert_to(jsonb_build_array(
    requested.first_name, requested.last_name, requested.reason, requested.scheduled_at,
    requested.subjects, requested.campuses
  )::text, 'UTF8'));
  prior private.booking_requests;
  booking public.consultations;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text || request_id::text, 0));
  select r.* into prior from private.booking_requests r
  where r.student_id = owner_id and r.request_id = book_consultation_once.request_id;

  if found then
    if prior.fingerprint <> fingerprint then
      raise sqlstate 'PT409' using message = 'This request was already used for different booking details.';
    end if;
    select c.* into booking from public.consultations c
    where c.id = prior.consultation_id and c.student_id = owner_id;
    if not found then
      raise sqlstate 'PT409' using message = 'This booking was already cancelled.';
    end if;
  elsif allow_create then
    insert into public.consultations (first_name, last_name, reason, scheduled_at, subjects, campuses)
    values (requested.first_name, requested.last_name, requested.reason, requested.scheduled_at,
            requested.subjects, requested.campuses)
    returning * into booking;
    insert into private.booking_requests (student_id, request_id, consultation_id, fingerprint)
    values (owner_id, request_id, booking.id, fingerprint);
    perform set_config('response.status', '201', true);
  else
    return;
  end if;
  return next booking;
end;
$$;

revoke all on function public.book_consultation_once(uuid, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.book_consultation_once(uuid, jsonb, boolean) to authenticated;
