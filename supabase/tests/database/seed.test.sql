begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(1);

select results_eq(
  $$select u.email::text, u.raw_user_meta_data ->> 'firstName', u.raw_user_meta_data ->> 'lastName',
           a.user_id is not null
    from auth.users u
    join auth.identities i on i.user_id = u.id and i.provider = 'email'
    left join admin_users a on a.user_id = u.id
    where u.email in ('admin@contour.test', 'student@contour.test') and u.email_confirmed_at is not null
    order by u.email$$,
  $$values ('admin@contour.test', 'Demo', 'Admin', true), ('student@contour.test', 'Demo', 'Student', false)$$,
  'Seeded logins have confirmed email identities, booking names and the expected admin membership'
);

select * from finish();
rollback;
