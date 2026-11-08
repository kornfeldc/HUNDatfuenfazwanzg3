### Supabase Setup & RLS Guide

This guide explains how to set up Supabase to work with the new Google login and how to enable Row Level Security (RLS) to protect your data.

#### 1. Authentication Setup
1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Authentication -> Providers**.
3.  Enable **Google**.
4.  You will need to provide a **Client ID** and **Client Secret** from the [Google Cloud Console](https://console.cloud.google.com/).
    *   Set the **Authorized redirect URIs** in Google Cloud Console to: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` (you can find this in the Supabase Google provider settings).

#### 2. Database Schema
Ensure you have a `users` table in the `public` schema. **Note:** If you followed the previous guide and created a table named `user` (singular), please rename it to `users` (plural) to avoid conflicts with reserved keywords.

```sql
-- 1. Rename the table if you created it as "user"
ALTER TABLE IF EXISTS public."user" RENAME TO users;
```

#### 3. Supabase URL Configuration
To support both **Production** and **Localhost** (debugging) using the same Supabase project:

1.  Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2.  Set **Site URL** to your **Production URL** (e.g., `https://your-app.com`).
3.  Under **Redirect URLs**, add the following URLs to whitelist them:
    *   `http://localhost:3000/**`
    *   `http://localhost:5173/**` (if using default Vite port)
    *   `https://your-production-app.com/**`
4.  Click **Save**.

#### 4. Course attendance migration

Apply [`supabase/migrations/20261108120000_course_attendance.sql`](supabase/migrations/20261108120000_course_attendance.sql)
in the Supabase SQL Editor **before deploying the attendance UI**. If this project is already
managed with the Supabase CLI, apply it through the usual migration workflow instead.
The migration is transactional and can be rerun. It adds an attendance index and three
database functions; it does not backfill or change existing balances.

Both the existing individual course adjustment and the new attendance actions now use
these functions. The database role `authenticated` needs the existing table permissions
and RLS policies to read people in its organization, insert course/audit history, update
people's course balances, and update course history for undo. The functions run as the
caller and additionally check organization membership against `public.users`.

Batch attendance locks people in ID order and records each person at most once per day.
An overlapping or retried batch skips people already recorded. Inactive people cannot
be added through this action; zero and negative balances are allowed. Individual course
adjustments still allow multiple deductions on the same day.

Undo restores exactly one unit, increasing the selected negative history entry toward
zero. A fully reversed entry remains at zero; it is not counted as attendance or a
purchase. The audit log preserves who corrected it, the attendance date, the history ID,
and the quantities before and after. A stale undo is rejected. Attendance, balances,
and audit records are written in one transaction, including for a whole batch.

Run `pnpm test:attendance` to verify calendar dates/ranking and execute the actual
migration/functions against an isolated PostgreSQL instance powered by PGlite.
These tests use local fixtures with tenant RLS policies and never connect to Supabase;
the deployed project's specific RLS policies should also be checked when applying
the migration.

This configuration tells Supabase to allow redirects to both your production domain and your local environment.
