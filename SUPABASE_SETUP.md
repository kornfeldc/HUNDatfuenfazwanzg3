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

#### 5. News for the homepage

The **News** tab under **Homepage** maintains the news shown on the public homepage of an Ortsgruppe
(svoe.og125.at reads the news of `og = 125`). Apply these migrations in the Supabase SQL Editor,
in this order:

1. [`supabase/migrations/20261112120000_news.sql`](supabase/migrations/20261112120000_news.sql) creates
   the `news` table. Published news (`isPublished`) are readable without login (role `anon`), which
   the static homepage needs. Creating, editing and deleting is limited to users whose
   `public.users.og` matches the news' `og`. Drafts are only visible to them.
2. [`supabase/migrations/20261112120100_news_import_og125.sql`](supabase/migrations/20261112120100_news_import_og125.sql)
   imports the 111 existing news from the old homepage for `og = 125`. It does nothing if
   og 125 already has news, so it can be rerun.

Run `pnpm test:news` to check the RLS policies and the import against PGlite.

#### 6. Photo albums for the homepage

The **Fotos** tab under **Homepage** maintains the albums of the gallery on the public homepage (svoe.og125.at/fotos reads
the albums of `og = 125`). The photos stay in Google Photos; an album stores its share link and a cover
image, which the app reads from the share page when the link is pasted. Apply these migrations in the
Supabase SQL Editor, in this order:

1. [`supabase/migrations/20261114120000_album.sql`](supabase/migrations/20261114120000_album.sql) creates
   the `album` table, with the same rules as `news`: published albums are readable without login (role
   `anon`), creating, editing and deleting is limited to users of the same `og`.
2. [`supabase/migrations/20261114120100_album_import_og125.sql`](supabase/migrations/20261114120100_album_import_og125.sql)
   imports the 61 albums of the current gallery for `og = 125`. It does nothing if og 125 already has
   albums, so it can be rerun.

Run `pnpm test:albums` to check the RLS policies, the import and the Google Photos parsing against PGlite.

#### 7. Events for the homepage (Edge Function)

The Veranstaltungen on the public homepage come from the Ortsgruppe's public Google Calendar (for og 125
"Kurse und Veranstaltungen"), not from the database. Browsers cannot read the calendar feed themselves, so
the Edge Function [`supabase/functions/events/index.ts`](supabase/functions/events/index.ts) reads it and
returns the upcoming events: single calendar entries **with a description**. Recurring course dates and
entries without a description are left out, so an event needs a description to appear on the homepage.

Deploy it once, and again after every change to the file:

- **Dashboard:** Edge Functions → Deploy a new function → Via Editor, name it `events`, replace the
  example code with the content of `index.ts` and deploy. Then open the function's settings and turn off
  **Enforce JWT verification** (it only returns public calendar data, and the homepage calls it without a key).
- **CLI:** `supabase functions deploy events --no-verify-jwt --project-ref <project ref>`

Check it with `curl "https://<project ref>.supabase.co/functions/v1/events?og=125"`; it answers with a JSON
list (empty when no event is planned). Another Ortsgruppe needs an entry in `calendars` in `index.ts`.
Run `pnpm test:events` to test the parsing in Node.

#### 8. Mailing list

Run [`supabase/migrations/20261114150000_person_mailing_list.sql`](supabase/migrations/20261114150000_person_mailing_list.sql)
in the Supabase SQL Editor. It adds the column `person."isOnMailingList"` (the checkbox "Auf Mailing-Liste",
off for everyone) and can be rerun. The existing person policies cover it.

Run `pnpm test:mailing` to check the migration and the export filters against PGlite.
