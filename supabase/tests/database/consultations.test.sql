begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(37);

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'student-a@example.invalid'),
  ('10000000-0000-0000-0000-000000000002', 'student-b@example.invalid'),
  ('10000000-0000-0000-0000-000000000003', 'admin@example.invalid'),
  ('10000000-0000-0000-0000-000000000004', 'another-admin@example.invalid');
insert into admin_users (user_id) values
  ('10000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000004');

insert into consultations (student_id, first_name, last_name, reason, scheduled_at, subject, campus) values
  ('10000000-0000-0000-0000-000000000001', 'Student', 'A', 'Maths', now() + interval '1 day', 'Test algebra', 'Test north'),
  ('10000000-0000-0000-0000-000000000002', 'Student', 'B', 'Science', now() + interval '2 days', 'Test biology', 'Test south');

select throws_ok(
  $$update consultations set subjects = null, campuses = null where student_id = '10000000-0000-0000-0000-000000000001'$$,
  '23502', null, 'A stored booking requires its subject and campus'
);

select ok(not has_table_privilege('anon', 'consultations', 'select'), 'Anonymous users cannot read bookings');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001"}';

select is((select array_agg(student_id) from consultations), array[auth.uid()], 'A student sees only their own consultation');
select is((select count(*) from admin_users), 0::bigint, 'A student cannot list administrator memberships');
select ok(not has_table_privilege('admin_users', 'insert'), 'A student cannot grant admin access');
select ok(not has_column_privilege('consultations', 'student_id', 'insert')
  and not has_column_privilege('consultations', 'student_id', 'update'), 'Ownership is immutable');
select ok(not has_column_privilege('consultations', 'subject', 'update')
  and not has_column_privilege('consultations', 'campus', 'update')
  and not has_column_privilege('consultations', 'subjects', 'update')
  and not has_column_privilege('consultations', 'campuses', 'update'), 'A booking retains its subjects and campuses');

with booked as (
  insert into consultations (first_name, last_name, reason, scheduled_at, subject, campus) values
    ('Student', 'A', 'History', now() + interval '3 days', 'Test algebra', 'Test north') returning *
) select ok((select student_id = auth.uid() and not is_complete
  and subjects = array['Test algebra'] and campuses = array['Test north']
  and subject = 'Test algebra' and campus = 'Test north' from booked), 'A scalar booking retains the owner, catalog choices and initial status');

select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, campus)
    values ('Student', 'A', 'Missing subject', now() + interval '1 day', 'Test north')$$,
  '23502', null, 'A booking requires a subject'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subject)
    values ('Student', 'A', 'Missing campus', now() + interval '1 day', 'Test algebra')$$,
  '23502', null, 'A booking requires a campus'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subject, campus)
    values ('Student', 'A', 'Blank subject', now() + interval '1 day', '   ', 'Test north')$$,
  '23514', null, 'Booking labels cannot be blank'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subject, campus)
    values ('Student', 'A', 'Long campus', now() + interval '1 day', 'Test algebra', repeat('X',161))$$,
  '23514', null, 'Booking labels are bounded'
);

with booked as (
  insert into consultations (first_name, last_name, reason, scheduled_at, subjects, campuses) values
    ('Student', 'A', 'Several choices', now() + interval '1 day',
     array['Mathematics, advanced', repeat('X', 160)], array['North', 'South']) returning *
) select ok((select student_id = auth.uid() and not is_complete
  and subjects = array['Mathematics, advanced', repeat('X', 160)] and campuses = array['North', 'South']
  and subject = 'Mathematics, advanced, ' || repeat('X', 160) and campus = 'North, South' from booked),
  'Plural choices retain their order and generate searchable summaries, including commas and long labels');

select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subjects, campuses)
    values ('Student', 'A', 'Empty subjects', now() + interval '1 day', '{}', array['North'])$$,
  '23502', null, 'A new booking requires at least one subject'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subjects, campuses)
    values ('Student', 'A', 'Empty campuses', now() + interval '1 day', array['Maths'], '{}')$$,
  '23502', null, 'A new booking requires at least one campus'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subjects, campuses)
    values ('Student', 'A', 'Repeated subject', now() + interval '1 day', array['Maths', 'Maths'], array['North'])$$,
  '23514', null, 'Subjects must be distinct'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subjects, campuses)
    values ('Student', 'A', 'Null campus', now() + interval '1 day', array['Maths'], array['North', null])$$,
  '23514', null, 'Campus choices cannot contain null'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subjects, campuses)
    values ('Student', 'A', 'Blank campus', now() + interval '1 day', array['Maths'], array['North', '  '])$$,
  '23514', null, 'Every campus label must contain text'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subjects, campuses)
    values ('Student', 'A', 'Long subject', now() + interval '1 day', array['Maths', repeat('X', 161)], array['North'])$$,
  '23514', null, 'The length limit applies to each subject label'
);
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subjects, campuses)
    values ('Student', 'A', 'Nested choices', now() + interval '1 day', array[['Maths'], ['English']], array['North'])$$,
  '23514', null, 'Choices must form a one-dimensional list'
);
with cancelled as (
  delete from consultations where reason = 'Several choices' returning id
) select is((select count(*) from cancelled), 1::bigint, 'Multiple selections create one cancellable consultation');

with changed as (
  update consultations set is_complete = true where reason = 'History' returning is_complete
) select ok((select is_complete from changed), 'An owner can mark a consultation complete');
with changed as (
  update consultations set scheduled_at = now() + interval '1 week' where reason = 'History' returning scheduled_at
) select is((select scheduled_at from changed), now() + interval '1 week', 'An owner can reschedule');
with changed as (
  update consultations set is_complete = false where reason = 'History' returning is_complete
) select ok((select not is_complete from changed), 'An owner can mark a consultation incomplete');

with changed as (
  update consultations set is_complete = true where reason = 'Science' returning id
) select is((select count(*) from changed), 0::bigint, 'Other students cannot change a booking');
with cancelled as (
  delete from consultations where reason = 'Science' returning id
) select is((select count(*) from cancelled), 0::bigint, 'Other students cannot cancel a booking');

select throws_ok(
  $$update consultations set scheduled_at = now() - interval '1 day' where reason = 'History'$$,
  '23514', 'Choose a future consultation time.', 'An owner must reschedule into the future'
);
with cancelled as (
  delete from consultations where reason = 'History' returning id
) select is((select count(*) from cancelled), 1::bigint, 'An owner can cancel a booking');
select throws_ok(
  $$insert into consultations (first_name, last_name, reason, scheduled_at, subject, campus)
    values ('Student', 'A', 'Past time', now() - interval '1 day', 'Test algebra', 'Test north')$$,
  '23514', 'Choose a future consultation time.', 'The database rejects a past booking'
);

set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000003"}';

select is((select array_agg(user_id) from admin_users), array[auth.uid()], 'An admin sees only their own membership');
select is((select count(*) from consultations where student_id in (
  '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'
)), 2::bigint, 'An admin can see consultations from both students');
with changed as (
  update consultations set is_complete = true returning id
) select is((select count(*) from changed), 0::bigint, 'Admin access does not grant updates to other bookings');
with cancelled as (
  delete from consultations returning id
) select is((select count(*) from cancelled), 0::bigint, 'Admin access does not grant cancellation of other bookings');

with booked as (
  insert into consultations (first_name, last_name, reason, scheduled_at, subject, campus) values
    ('Admin', 'Student', 'Exam review', now() + interval '1 day', 'Test algebra', 'Test north') returning student_id
) select is((select student_id from booked), auth.uid(), 'An admin can book as a student');
with changed as (
  update consultations set is_complete = true where student_id = auth.uid() returning is_complete
) select ok((select is_complete from changed), 'An admin can update their own booking');
with cancelled as (
  delete from consultations where student_id = auth.uid() returning id
) select is((select count(*) from cancelled), 1::bigint, 'An admin can cancel their own booking');

reset role;
delete from admin_users where user_id = '10000000-0000-0000-0000-000000000003';
set local role authenticated;

select is((select count(*) from consultations where student_id <> auth.uid()), 0::bigint,
  'Removing admin membership revokes access to other bookings in the same session');

select * from finish();
rollback;
