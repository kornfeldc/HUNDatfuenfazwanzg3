import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

let db;
const day = '2026-01-10';
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const record = (ids, date = day, og = 1) =>
	query('select public.record_course_attendance($1, $2, $3) as added', [og, ids, date]);
const adjust = (personId, amount, date = day) =>
	query('select public.adjust_person_courses(1, $1, $2, $3) as id', [personId, amount, date]);
const undo = (personId, historyId, courses = -1, date = day) =>
	query('select public.undo_course_attendance(1, $1, $2, $3, $4)', [
		personId,
		historyId,
		date,
		courses
	]);
const login = (email = 'trainer@example.com') =>
	query("select set_config('test.email', $1, false)", [email]);

before(async () => {
	db = new PGlite();
	await db.exec(`
		create role anon; create role authenticated;
		create schema auth;
		create function auth.jwt() returns jsonb language sql stable as
		$$ select jsonb_build_object('email', current_setting('test.email', true)) $$;
		create function auth.uid() returns uuid language sql stable as
		$$ select case when coalesce(current_setting('test.email', true), '') <> ''
			then '00000000-0000-0000-0000-000000000001'::uuid else null end $$;
		grant usage on schema auth to authenticated;
		create table public.users (login text primary key, og integer);
		create table public.person (id serial primary key, og integer, "firstName" text, "lastName" text,
			"isActive" boolean, "courseCount" integer not null default 0);
		create table public.course_history (id serial primary key, "personId" integer references public.person,
			courses integer not null, date date);
		create table public.history (id serial primary key, "userEmail" text, action text, "entityType" text,
			"entityId" text, details text, og integer, timestamp timestamptz default now());
		grant select, insert, update, delete on all tables in schema public to authenticated;
		grant usage, select on all sequences in schema public to authenticated;
		alter table public.person enable row level security;
		alter table public.course_history enable row level security;
		alter table public.history enable row level security;
		alter table public.users enable row level security;
		create policy own_user on public.users for select to authenticated using (login = auth.jwt()->>'email');
		create policy own_person on public.person to authenticated using
			(og in (select og from public.users where login = auth.jwt()->>'email'));
		create policy own_course on public.course_history to authenticated using
			(exists (select 1 from public.person p where p.id = "personId"));
		create policy own_history on public.history to authenticated using
			(og in (select og from public.users where login = auth.jwt()->>'email'));
	`);
	await db.exec(
		await readFile(
			new URL('../supabase/migrations/20261108120000_course_attendance.sql', import.meta.url),
			'utf8'
		)
	);
});

after(async () => {
	await db?.close();
});
beforeEach(async () => {
	await db.exec(`reset role; truncate public.history, public.course_history, public.person, public.users restart identity cascade;
		insert into public.users values ('trainer@example.com', 1), ('colleague@example.com', 1), ('outsider@example.com', 2);
		insert into public.person (og, "firstName", "lastName", "isActive", "courseCount") values
			(1, 'Anna', 'Regular', true, 5), (1, 'Ben', 'Newcomer', true, 0),
			(1, 'Chris', 'Inactive', false, 5), (2, 'Dora', 'Other tenant', true, 5);
		set role authenticated;`);
	await login();
});

test('backdated batch deducts once, includes newcomers with no credit and logs date/actor/entry', async () => {
	assert.deepEqual((await record([1, 2, 1]))[0].added, [1, 2]);
	assert.deepEqual(
		await query('select id, "courseCount" from public.person where id in (1, 2) order by id'),
		[
			{ id: 1, courseCount: 4 },
			{ id: 2, courseCount: -1 }
		]
	);
	const audit = await query('select * from public.history order by id');
	assert.equal(audit.length, 2);
	assert.equal(audit[0].userEmail, 'trainer@example.com');
	assert.match(audit[0].details, /2026-01-10.*Course history ID: 1/);
});

test('retrying or overlapping a batch skips existing attendance without a second deduction', async () => {
	await record([1]);
	assert.deepEqual((await record([1, 2]))[0].added, [2]);
	assert.deepEqual((await record([1, 2]))[0].added, []);
	assert.equal((await query('select count(*)::int as n from public.course_history'))[0].n, 2);
});

test('a mixed batch with an inactive person fails without partial attendance or balance changes', async () => {
	await assert.rejects(record([1, 3]), /Only active/);
	assert.equal((await query('select count(*)::int as n from public.course_history'))[0].n, 0);
	assert.equal(
		(await query('select "courseCount" from public.person where id = 1'))[0].courseCount,
		5
	);
});

test('cross-organization and missing people fail the whole batch', async () => {
	await assert.rejects(record([1, 4]), /Only active/);
	await assert.rejects(record([1, 999]), /Only active/);
	await assert.rejects(record([4], day, 2), /access denied/);
});

test('empty, null, future and impossible dates cannot record attendance', async () => {
	await assert.rejects(record([]), /Select attendees/);
	await assert.rejects(record([null]), /Select attendees/);
	await assert.rejects(record([1], null), /Invalid attendance/);
	await assert.rejects(record([1], '2999-01-01'), /Invalid attendance/);
	await assert.rejects(record([1], '2026-02-30'), /date\/time field value out of range/);
});

test('a colleague can undo exactly one unit of a multi-unit deduction and retries fail safely', async () => {
	const [{ id }] = await adjust(1, -2);
	await login('colleague@example.com');
	await undo(1, id, -2);
	assert.equal(
		(await query('select courses from public.course_history where id = $1', [id]))[0].courses,
		-1
	);
	assert.equal(
		(await query('select "courseCount" from public.person where id = 1'))[0].courseCount,
		4
	);
	await assert.rejects(undo(1, id, -2), /Attendance changed/);
	await undo(1, id, -1);
	await assert.rejects(undo(1, id, -1), /Attendance changed/);
	const audit = await query("select * from public.history where action = 'undo_course'");
	assert.equal(audit.length, 2);
	assert.equal(audit[0].userEmail, 'colleague@example.com');
	assert.match(audit[0].details, /2026-01-10.*-2 → -1/);
	assert.equal(
		(await query('select "courseCount" from public.person where id = 1'))[0].courseCount,
		5
	);
});

test('undo rejects mismatched person, date, positive purchases and other tenants', async () => {
	const [{ id }] = await adjust(1, -1);
	const [{ id: purchase }] = await adjust(1, 10);
	await assert.rejects(undo(2, id), /Attendance changed/);
	await assert.rejects(undo(1, id, -1, '2026-01-09'), /Attendance changed/);
	await assert.rejects(undo(1, purchase, 10), /Attendance changed/);
	await login('outsider@example.com');
	await assert.rejects(undo(1, id), /access denied/);
});

test('fully reversed attendance can be recorded again and legacy extra deductions still work', async () => {
	await record([1]);
	const [{ id }] = await query('select id from public.course_history');
	await undo(1, id);
	assert.deepEqual((await record([1]))[0].added, [1]);
	await adjust(1, -1);
	assert.equal(
		(await query('select sum(-courses)::int as n from public.course_history where courses < 0'))[0]
			.n,
		2
	);
});

test('audit failure rolls back the entire batch and restores all balances', async () => {
	await db.exec(
		'reset role; alter table public.history add constraint reject_second_person check ("entityId" <> \'2\'); set role authenticated;'
	);
	try {
		await assert.rejects(record([1, 2]), /reject_second_person/);
		assert.equal((await query('select count(*)::int as n from public.course_history'))[0].n, 0);
		assert.equal(
			(await query('select "courseCount" from public.person where id = 1'))[0].courseCount,
			5
		);
	} finally {
		await db.exec(
			'reset role; alter table public.history drop constraint reject_second_person; set role authenticated;'
		);
	}
});

test('anonymous requests and RLS-denied balance updates fail without recording attendance', async () => {
	await login('');
	await assert.rejects(record([1]), /access denied/);
	await login();
	await db.exec(`reset role; drop policy own_person on public.person;
		create policy read_person on public.person for select to authenticated using (og = 1);
		create policy deny_update on public.person for update to authenticated using (og = 1) with check (false);
		set role authenticated;`);
	await assert.rejects(record([1]), /row-level security/);
	assert.equal((await query('select count(*)::int as n from public.course_history'))[0].n, 0);
});
