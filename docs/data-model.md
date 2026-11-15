# Data model

Supabase (Postgres), schema `public`. Column names are camelCase, so SQL needs them quoted (`"personId"`). Every tenant table has an `og` column (the Ortsgruppe, e.g. 125). The app scopes every query by it, and RLS policies match it against `public.users.og` of the logged-in user.

This is a snapshot taken from the database, plus later migrations in `supabase/migrations/`. When they disagree, the migrations and `src/lib/data/hfzSupabaseApi.ts` win; update this file when you change the schema.

## Tables

### `person`
`id` integer (serial); `og` integer; `firstName` varchar (not null); `lastName` varchar (not null); `isMember` boolean (not null); `mainPersonId` integer; `personGroup` varchar (not null); `credit` double (not null); `saleCount` integer (not null); `saleSum` double (not null); `phone` varchar; `email` varchar; `extId` varchar; `isActive` boolean; `saleCountActive` integer; `courseCount` integer (not null, default 0); `dogNames` varchar; `info` varchar; `isOnMailingList` boolean (not null, default false); `birthDate` date; `street` varchar; `postalCode` varchar; `city` varchar; `dogBreed` varchar; `dogSex` varchar (`male` / `female`); `dogBirthDate` date; `dogChipNumber` varchar; `dogInsuranceNumber` varchar; `photoConsent` boolean (not null, default false); `referralSource` varchar; `registeredAt` timestamptz

`credit`, `courseCount`, `saleCount` and `saleSum` are running balances. Change them together with the matching `credit_history` / `course_history` / `sale` rows. `mainPersonId` links family members to the person who pays. `isOnMailingList` is the opt-in for the mailing list export (tab "Mailing Liste" under Homepage); only persons with it and an `email` are exported.

The fields from `birthDate` on come from the course registration form ("Kursanmeldung"). `registeredAt` is set when the person registered on the public homepage (`register_person`); the dog fields describe the dog named in `dogNames` at registration. `photoConsent` is the consent to publish photos and videos of the person; online registrations always have it, because it is part of the accepted terms.

### `course_history`
`id` integer (serial); `personId` integer; `courses` integer (not null; positive = bought, negative = attended); `date` date

Courses are only changed through the database functions below, which lock the person row and write the audit entry.

### `credit_history`
`id` integer (serial); `personId` integer; `credit` double (not null); `isBought` boolean (not null); `saleId` integer; `date` date

### `article`
`id` integer (serial); `og` integer (not null); `title` varchar (not null); `type` varchar (not null; keys of `ArticleTypes` in `hfzApi.ts`); `price` numeric (not null); `isFavorite` boolean (not null); `extId` varchar; `isActive` boolean

### `sale`
`id` integer (serial); `og` integer (not null); `personId` integer (null for cash sales); `personName` varchar (not null); `saleDate` date; `articleSum` numeric; `given` double (not null); `inclTip` double (not null); `toPay` double (not null); `toReturn` double (not null); `usedCredit` boolean (not null); `addAdditionalCredit` double (not null); `payDate` date (null = unpaid); `extId` varchar

### `sale_article`
`id` integer (serial); `og` integer (not null); `saleId` integer; `articleId` integer; `articleTitle` varchar (not null); `articlePrice` double (not null); `amount` integer (not null)

Title and price are copied from the article, so later article edits do not change old sales.

### `rob_course`
`id` integer (serial); `og` integer; `date` date; `maxPersons` integer; `link` varchar (random public link id)

### `rob_course_person`
`id` integer (serial); `timestamp` timestamptz (default now); `robCourseId` integer; `personName` varchar; `dogName` varchar

Filled by the public registration page `/rob/[link]`, which runs without login (role `anon`).

### `news`
`id` integer (identity); `og` integer; `date` date; `title` text; `content` text; `isPublished` boolean (default true); `createdAt` timestamptz

News for the public homepage (svoe.og125.at). Published rows are readable without login (role `anon`).

### `album`
`id` integer (identity); `og` integer; `date` date (sorts the gallery, sets its year filter); `dateText` text (shown instead of the date when set, e.g. `2025`); `title` text; `link` text (Google Photos share link); `coverUrl` text; `isPublished` boolean (default true); `createdAt` timestamptz

Photo albums for the gallery of the public homepage (svoe.og125.at/fotos). The photos stay in Google Photos; `src/lib/googlePhotos.ts` reads title, date and cover from the share page. Published rows are readable without login (role `anon`).

### `users`
`login` varchar (not null; the Google e-mail); `og` integer (null until an admin assigns one); `theme` varchar (default `'system'`); `admin` boolean (default false); `disabled` boolean (not null, default false); legacy columns `pw`, `hash`, `usetop`

A user is inserted automatically on first Google login (`src/hooks.server.ts`). A disabled user keeps the row (and so the history entries stay attributable) but is sent to `/disabled` instead of `/l/**`; a restrictive policy `login_enabled` on every tenant table (and on insert/update/delete of `users`) denies the user all data access. Only `set_user_disabled` can change the flag (trigger `users_guard_disabled`).

### `history`
`id` serial; `timestamp` timestamptz (default now); `userEmail` text; `action` text; `entityType` text; `entityId` text; `details` text; `og` integer

Audit log, written by `logAction` in `hfzSupabaseApi.ts` and by the database functions. Reconstructed from the code, not from a database snapshot.

### Not used by the app
`person_article_usage` (`personId`, `articleId`, `amount`) and `sale_day` (`og`, `day`, `payed`, `toPay`).

## Database functions

From `supabase/migrations/20261115120000_person_registration.sql`. `security definer` and executable by `anon`, because the public homepage calls it without login.

- `register_person(p_og, p_first_name, p_last_name, p_birth_date, p_street, p_postal_code, p_city, p_phone, p_email, p_dog_name, p_dog_breed, p_dog_sex, p_dog_birth_date, p_dog_chip_number, p_dog_insurance_number, p_mailing_list, p_referral_source, p_accept_terms)`: creates an active non-member person from the course registration form and writes a `register` entry to `history`. Sets `photoConsent`, which is part of the terms. Requires an `og` that has users, accepted terms, first and last name, address (street, postal code, city), phone, a valid email and the dog's name, chip and insurance number; caps text at 200 characters and registrations at 20 per hour and `og`.

From `supabase/migrations/20261108120000_course_attendance.sql`. They are `security invoker`, so RLS still applies, and each one checks that the caller's `users.og` matches `p_og`.

- `adjust_person_courses(p_og, p_person_id, p_amount, p_date) → integer`: adds or deducts courses for one person; returns the `course_history` id.
- `record_course_attendance(p_og, p_person_ids[], p_date) → integer[]`: deducts one course per person, at most once per person and day; returns the ids actually recorded.
- `undo_course_attendance(p_og, p_person_id, p_history_id, p_date, p_expected_courses)`: gives one course back on an attendance entry; rejects stale undos.

From `supabase/migrations/20261114170000_users_disabled.sql`. They are `security definer`, so they do not depend on the policies of `users`.

- `login_enabled() → boolean`: false when the caller's `users` row is disabled; used by the `login_enabled` policies.
- `og_users(p_og) → table (login, admin, disabled)`: the users of an Ortsgruppe; only for enabled admins of `p_og`.
- `set_user_disabled(p_og, p_login, p_disabled)`: disables or enables a user of `p_og` (not oneself) and writes a `disable` / `enable` entry to `history`; only for enabled admins of `p_og`.
