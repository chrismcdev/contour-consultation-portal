with demo_accounts (email, last_name, password) as (
  values
    ('student@contour.test', 'Student', '0ELd_sLt8jdObz1N9a!'),
    ('admin@contour.test', 'Admin', '7-NVanBfgowtuO8e9a!')
), created_users as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  select
    '00000000-0000-0000-0000-000000000000'::uuid, gen_random_uuid(),
    'authenticated', 'authenticated', email,
    extensions.crypt(password, extensions.gen_salt('bf', 10)), now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('firstName', 'Demo', 'lastName', last_name), now(), now()
  from demo_accounts
  on conflict do nothing
  returning id, email
), created_identities as (
  insert into auth.identities (user_id, provider_id, provider, identity_data, created_at, updated_at)
  select
    id, id::text, 'email',
    jsonb_build_object('sub', id, 'email', email, 'email_verified', true, 'phone_verified', false),
    now(), now()
  from created_users
  returning user_id, email
)
insert into public.admin_users (user_id)
select user_id from created_identities where email = 'admin@contour.test';
