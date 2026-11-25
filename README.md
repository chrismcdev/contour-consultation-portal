# Contour Consultation Portal

A consultation portal built with Next.js 16 (App Router), TypeScript and Supabase. Students can book, reschedule, cancel and mark their consultations complete or incomplete. Admins can view all bookings in a read-only dashboard.

## Run locally

Start Docker, then run these commands from the project root using Node.js 24 and npm.

```sh
npm ci
npx supabase@2.122.1 start
cp .env.example .env.local
```

In `.env.local`, set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the **Publishable** key printed by Supabase. The example includes the local API URL. Run `npm run dev` and open the [sign-in page](http://localhost:3000/auth/login).

Signup and booking need internet access to load Contour’s school, year, subject and campus options.

## Test accounts

On first start, Supabase applies the [schema migrations](./supabase/migrations) and [seeds these accounts](./supabase/seed.sql).

| Role    | Email                  | Password              |
| ------- | ---------------------- | --------------------- |
| Student | `student@contour.test` | `0ELd_sLt8jdObz1N9a!` |
| Admin   | `admin@contour.test`   | `7-NVanBfgowtuO8e9a!` |

Sign in as the student and choose **Book a consultation**. First and last names are prefilled. Choose a subject, campus and future date and time, then enter a reason. After booking, log out and sign in as the admin. Open **All student bookings** and search for that reason.

## Implementation and decisions

- **Authentication.** Supabase Auth and `@supabase/ssr` manage cookie-based sessions. Local email confirmation is off so new students can go straight to their dashboard.
- **Booking API.** Next.js Route Handlers validate requests with Zod and write to PostgreSQL through `@supabase/supabase-js`. A request ID prevents duplicate bookings on retry.
- **Permissions.** PostgreSQL row-level security enforces ownership even for direct database requests. Only the owner can change or cancel a booking. A database operator grants staff read access across students by adding them to `admin_users`.
- **Scheduling.** Times display in the student's time zone. Bookings can overlap because no tutor is assigned. Once the scheduled time passes, the booking appears in **History**. Students decide when to mark it complete.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npx supabase@2.122.1 test db
```

The [database tests](./supabase/tests/database) cover permissions, booking rules and retries. The UI uses [Mantine UI blocks](https://ui.mantine.dev/) under the [MIT license](./MANTINE-UI-LICENSE.txt).
