import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

let db;
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const as = async (role, email = '') => {
	await db.exec(`reset role; set role ${role};`);
	await query("select set_config('test.email', $1, false)", [email]);
};

before(async () => {
	db = new PGlite();
	await db.exec(`
		create role anon; create role authenticated;
		create schema auth;
		create function auth.jwt() returns jsonb language sql stable as
		$$ select jsonb_build_object('email', current_setting('test.email', true)) $$;
		grant usage on schema auth to anon, authenticated;
		create table public.users (login varchar primary key, og integer, theme varchar default 'system', admin boolean default false);
		create table public.person (id serial primary key, og integer, "firstName" varchar);
		create table public.history (id serial primary key, timestamp timestamptz default now(), "userEmail" text,
			action text, "entityType" text, "entityId" text, details text, og integer);
		alter table public.users enable row level security;
		alter table public.person enable row level security;
		alter table public.history enable row level security;
		create policy own_user on public.users for select to authenticated using (login = auth.jwt()->>'email');
		create policy own_theme on public.users for update to authenticated using (login = auth.jwt()->>'email');
		create policy own_insert on public.users for insert to authenticated with check (login = auth.jwt()->>'email');
		create policy own_person on public.person to authenticated using
			(og in (select og from public.users where login = auth.jwt()->>'email'));
		create policy own_history on public.history to authenticated using
			(og in (select og from public.users where login = auth.jwt()->>'email'));
		grant select, insert, update, delete on public.users, public.person, public.history to authenticated;
		grant usage on all sequences in schema public to authenticated;
	`);
	const sql = await readFile(new URL('../supabase/migrations/20261114170000_users_disabled.sql', import.meta.url), 'utf8');
	await db.exec(sql);
	await db.exec(sql);
});

after(async () => {
	await db?.close();
});

beforeEach(async () => {
	await db.exec(`reset role; truncate public.users, public.person, public.history restart identity;
		insert into public.users (login, og, admin) values
			('admin@example.com', 125, true), ('trainer@example.com', 125, false),
			('old@example.com', 125, false), ('other-admin@example.com', 2, true);
		update public.users set disabled = true where login = 'old@example.com';
		insert into public.person (og, "firstName") values (125, 'Anna');`);
});

test('existing users stay enabled', async () => {
	await db.exec('reset role; alter table public.users drop column disabled cascade;');
	await db.exec(await readFile(new URL('../supabase/migrations/20261114170000_users_disabled.sql', import.meta.url), 'utf8'));
	assert.deepEqual(await query('select count(*)::int as n from public.users where disabled'), [{ n: 0 }]);
});

test('a disabled user has no access to the data but still sees the own users row', async () => {
	await as('authenticated', 'old@example.com');
	assert.equal((await query('select * from public.person')).length, 0);
	assert.equal((await query('select * from public.history')).length, 0);
	await assert.rejects(query("insert into public.person (og, \"firstName\") values (125, 'Neu')"));
	assert.deepEqual(await query('select disabled from public.users'), [{ disabled: true }]);

	await as('authenticated', 'trainer@example.com');
	assert.equal((await query('select * from public.person')).length, 1);
});

test('users cannot change the flag themselves', async () => {
	await as('authenticated', 'old@example.com');
	assert.equal((await query("update public.users set disabled = false, theme = 'dark' returning login")).length, 0);
	assert.equal((await query('delete from public.users returning login')).length, 0);

	await as('authenticated', 'trainer@example.com');
	await query("update public.users set theme = 'dark'");
	await assert.rejects(query('update public.users set disabled = true'));
	await as('authenticated', 'new@example.com');
	await assert.rejects(query("insert into public.users (login, disabled) values ('new@example.com', true)"));
	await query("insert into public.users (login) values ('new@example.com')");
});

test('admins list the users of their organization', async () => {
	await as('authenticated', 'admin@example.com');
	assert.deepEqual(await query('select * from public.og_users(125)'), [
		{ login: 'admin@example.com', admin: true, disabled: false },
		{ login: 'trainer@example.com', admin: false, disabled: false },
		{ login: 'old@example.com', admin: false, disabled: true }
	]);
	await assert.rejects(query('select * from public.og_users(2)'));

	await as('authenticated', 'trainer@example.com');
	await assert.rejects(query('select * from public.og_users(125)'));
});

test('admins disable and enable users of their organization and it is logged', async () => {
	await as('authenticated', 'admin@example.com');
	await query("select public.set_user_disabled(125, 'trainer@example.com', true)");
	await query("select public.set_user_disabled(125, 'old@example.com', false)");

	await db.exec('reset role;');
	assert.deepEqual(await query('select login, disabled from public.users where og = 125 order by login'), [
		{ login: 'admin@example.com', disabled: false },
		{ login: 'old@example.com', disabled: false },
		{ login: 'trainer@example.com', disabled: true }
	]);
	assert.deepEqual(await query('select "userEmail", action, "entityType", "entityId", og from public.history order by id'), [
		{ userEmail: 'admin@example.com', action: 'disable', entityType: 'user', entityId: 'trainer@example.com', og: 125 },
		{ userEmail: 'admin@example.com', action: 'enable', entityType: 'user', entityId: 'old@example.com', og: 125 }
	]);
});

test('set_user_disabled rejects everything else', async () => {
	await as('authenticated', 'admin@example.com');
	await assert.rejects(query("select public.set_user_disabled(125, 'admin@example.com', true)"));
	await assert.rejects(query("select public.set_user_disabled(125, 'other-admin@example.com', true)"));
	await assert.rejects(query("select public.set_user_disabled(2, 'other-admin@example.com', true)"));

	await as('authenticated', 'trainer@example.com');
	await assert.rejects(query("select public.set_user_disabled(125, 'old@example.com', false)"));

	await as('anon');
	await assert.rejects(query("select public.set_user_disabled(125, 'old@example.com', false)"));
});

test('a disabled admin cannot manage users', async () => {
	await db.exec("reset role; update public.users set disabled = true where login = 'admin@example.com';");
	await as('authenticated', 'admin@example.com');
	await assert.rejects(query('select * from public.og_users(125)'));
	await assert.rejects(query("select public.set_user_disabled(125, 'old@example.com', false)"));
});
