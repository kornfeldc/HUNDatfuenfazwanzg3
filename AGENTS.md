# HUNDatfuenfazwanzg3 (HFZ)

Management app for the dog training club SVÖ OG 125: persons and family members, course credits and attendance, cantina sales with prepaid credit, articles, and "ROB" courses with public registration. SvelteKit 2 / Svelte 5, Tailwind 4, shadcn-svelte, Supabase (Google login, Postgres with RLS). UI text is German; code and docs are English.

- `docs/data-model.md`: tables, columns and database functions. Read it before writing queries or migrations.
- `SUPABASE_SETUP.md`: auth setup and every migration the user has to apply.

## Git workflow

`main` changes only through pull requests that the user merges. Never commit or push to `main` directly.

1. Do the work in the working tree, uncommitted and unstaged.
2. When it is done, summarise the change and propose a branch name (`feat/…`, `fix/…`, `chore/…`, `docs/…`), the commit message and the PR title. Then wait.
3. Only after the user's "ok": branch off `main`, stage only the files that belong to this change, commit, `git push -u origin <branch>`, and open the PR with `gh pr create --base main`.
4. Reply with the PR URL. Merging is the user's job.

One "ok" covers one PR. Follow-up changes to an open PR go onto its branch, again only after an "ok".

## Architecture

- **Tenancy:** `src/hooks.server.ts` looks up the logged-in Google user in `public.users` and sets `locals.og`. `/l/**` requires a login and an `og`; users without one land on `/no-tenant`.
- **Data access:** every page goes through `HfzApi.create(locals.supabase, locals.og!)`, which returns `HfzSupabaseApi` (`src/lib/data/hfzSupabaseApi.ts`, interface and types in `hfzApi.ts`). Scope each query with `.eq('og', this.og)` on top of RLS, and log every create/update/delete with `logAction`; `History.svelte` maps the entity names to German labels. `HfzMockApi` is unused and out of date.
- **Modules:** a list page in `src/routes/l/modules/<name>` plus an edit page in `src/routes/l/dialogs/<name>/[[id]]` with a default form action (`articles` / `article` is the simplest example). A new module needs entries in `AppSidebar.svelte` and `MobileBreadcrumb.svelte`; modules for the public homepage (`news`, `albums`) share the "Homepage" sidebar entry and switch via `HomepageTabs.svelte`; `MobileDock.svelte` only lists the four main modules. `TopBar.svelte` and `NavigationBar.svelte` are unused.
- **Dates and money:** `moment` and `Util` from `$lib/util` (German locale, `Util.formatDate`, `Util.formatCurrency`).

## Database changes

The live database is the user's. Write SQL as a new `supabase/migrations/<yyyymmddhhmmss>_<name>.sql`, transactional and safe to rerun (`if not exists`, `create or replace`, `drop policy if exists`). Add a section to `SUPABASE_SETUP.md` telling the user to apply it in the Supabase SQL Editor, and update `docs/data-model.md`. New tables get an `og` column, RLS enabled, and policies that check `public.users.og` via `auth.jwt() ->> 'email'`. Anything reachable without login (role `anon`, e.g. `/rob/[link]`) needs its own policy.

## Gotchas

- Use pnpm (`pnpm-lock.yaml`); the README's npm examples are outdated.
- Most files do not match the Prettier config (4-space indentation instead of tabs). Match the style of the file you edit; `pnpm format` would reformat almost the whole app.
- `.env` holds `VITE_SUPABASE_URL` and the anon `VITE_SUPABASE_KEY`. RLS is the only thing protecting the data.

## Checks

Before proposing a PR:

- `pnpm check` has existing errors on `main`. Your change must add no new ones; compare against `main`.
- Run the `test:*` scripts from `package.json`. They execute the migrations against PGlite and never touch Supabase. Logic in a migration gets a test there.
