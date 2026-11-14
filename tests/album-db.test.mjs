import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

let db;
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const migration = (name) => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
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
		create table public.users (login text primary key, og integer);
		alter table public.users enable row level security;
		create policy own_user on public.users for select to authenticated using (login = auth.jwt()->>'email');
		grant select on public.users to authenticated;
	`);
	await db.exec(await migration('20261114120000_album.sql'));
});

after(async () => {
	await db?.close();
});

beforeEach(async () => {
	await db.exec(`reset role; truncate public.album, public.users restart identity;
		insert into public.users values ('trainer@example.com', 125), ('outsider@example.com', 2);
		insert into public.album (og, date, title, link, "isPublished") values
			(125, '2026-10-01', 'Published', 'https://photos.app.goo.gl/a', true),
			(125, '2026-10-02', 'Draft', 'https://photos.app.goo.gl/b', false),
			(2, '2026-10-03', 'Other tenant', 'https://photos.app.goo.gl/c', true);`);
});

test('anonymous visitors only see published albums', async () => {
	await as('anon');
	assert.deepEqual(
		(await query('select title from public.album where og = 125')).map((r) => r.title),
		['Published']
	);
	await assert.rejects(query("insert into public.album (og, date, title, link) values (125, '2026-01-01', 'Spam', 'x')"));
});

test('users manage the albums of their own organization, including drafts', async () => {
	await as('authenticated', 'trainer@example.com');
	assert.equal((await query('select * from public.album where og = 125')).length, 2);

	const [{ id }] = await query(
		"insert into public.album (og, date, title, link) values (125, '2026-11-01', 'Neu', 'https://photos.app.goo.gl/d') returning id"
	);
	await query("update public.album set title = 'Geändert', \"isPublished\" = false where id = $1", [id]);
	assert.deepEqual(await query('select title, "isPublished" from public.album where id = $1', [id]), [
		{ title: 'Geändert', isPublished: false }
	]);
	await query('delete from public.album where id = $1', [id]);
	assert.equal((await query('select * from public.album where id = $1', [id])).length, 0);
});

test('users cannot change albums of another organization', async () => {
	await as('authenticated', 'outsider@example.com');
	await assert.rejects(query("insert into public.album (og, date, title, link) values (125, '2026-01-01', 'Fremd', 'x')"));
	assert.equal((await query("update public.album set title = 'x' where og = 125 returning id")).length, 0);
	assert.equal((await query('delete from public.album where og = 125 returning id')).length, 0);
	assert.equal((await query("select * from public.album where og = 125 and title = 'Draft'")).length, 0);
});

test('og 125 import brings all gallery albums, newest first, and can be rerun', async () => {
	await db.exec('truncate public.album restart identity;');
	const sql = await migration('20261114120100_album_import_og125.sql');
	await db.exec(sql);
	await db.exec(sql);

	const rows = await query(
		'select date::text, "dateText", title from public.album where og = 125 order by date desc, id desc'
	);
	assert.equal(rows.length, 61);
	assert.deepEqual(rows[0], { date: '2026-06-20', dateText: null, title: '13. Funturnier' });
	assert.deepEqual(rows.at(-1), { date: '2008-05-17', dateText: null, title: '20 Jahre SVÖ Oggau' });
	assert.ok(rows.some((r) => r.dateText === '27.–28. Oktober 2018' && r.title === 'Bgld. LM'));
	assert.ok(rows.some((r) => r.dateText === '2025' && r.title === 'Frühjahrskurs'));
});
