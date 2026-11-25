begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(10);

insert into auth.users (id, email) values
  ('20000000-0000-0000-0000-000000000001', 'request-a@example.invalid'),
  ('20000000-0000-0000-0000-000000000002', 'request-b@example.invalid');

create function pg_temp.book(allow_create boolean default true, reason text default 'Revision')
returns setof public.consultations language sql as $$
  select * from public.book_consultation_once('30000000-0000-4000-8000-000000000001',
    jsonb_build_object('first_name', 'Demo', 'last_name', 'Student', 'reason', reason,
      'scheduled_at', now() + interval '2 days', 'subjects', array['Maths'], 'campuses', array['North']),
    allow_create)
$$;

select ok(not has_function_privilege('anon', 'public.book_consultation_once(uuid,jsonb,boolean)', 'EXECUTE'),
  'Anonymous callers cannot use booking requests');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000001"}';
select is((select count(*) from pg_temp.book(false)), 0::bigint, 'An unrecorded request can be checked without inserting');
create temp table first_booking as select * from pg_temp.book();
select is((select student_id from first_booking), auth.uid(), 'A new request books for the authenticated owner');
select is((select id from pg_temp.book()), (select id from first_booking), 'A matching retry returns the original ID');
select is((select count(*) from consultations), 1::bigint, 'Replaying the key does not create another booking');
select throws_ok($$select * from pg_temp.book(true, 'Different reason')$$, 'PT409', null,
  'Different details cannot reuse a booking key');
update consultations set scheduled_at = now() + interval '3 days' where id = (select id from first_booking);
select is((select scheduled_at from pg_temp.book(false)), now() + interval '3 days',
  'An original request still finds its booking after rescheduling');

set local "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000002"}';
select is((select count(*) from pg_temp.book(false)), 0::bigint, 'Request history is private to the owner');
select is((select student_id from pg_temp.book()), auth.uid(), 'A second account can use the same key independently');

set local "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000001"}';
delete from consultations where id = (select id from first_booking);
select throws_ok($$select * from pg_temp.book()$$, 'PT409', 'This booking was already cancelled.',
  'A late retry cannot recreate a cancelled booking');
select * from finish();
rollback;
