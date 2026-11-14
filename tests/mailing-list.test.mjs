import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { buildMailingList, courseCutoff, toCsv } from '../src/lib/mailingList.ts';

const today = '2026-11-14';
const person = (id, firstName, email, isMember = false, lastCourseDate = null) =>
	({ id, firstName, lastName: 'Muster', email, isMember, lastCourseDate });
const persons = [
	person(1, 'Anna', 'anna@example.com', true),
	person(2, 'Bert', 'bert@example.com', false, '2026-11-01'),
	person(3, 'Clara', 'clara@example.com', false, '2026-05-01'),
	person(4, 'Dora', 'dora@example.com', true, '2026-10-20'),
	person(5, 'Emil', ''),
	person(6, 'Fritz', 'kein-email'),
	person(7, 'Gina', null, true)
];
const emails = (filter) => buildMailingList(persons, filter, today).map((e) => e.email);

test('the migration adds the opt-in, off by default, and can be rerun', async () => {
	const db = new PGlite();
	const sql = await readFile(new URL('../supabase/migrations/20261114150000_person_mailing_list.sql', import.meta.url), 'utf8');
	await db.exec('create table public.person (id serial primary key, "firstName" varchar not null);');
	await db.exec("insert into public.person (\"firstName\") values ('Alt');");
	await db.exec(sql);
	await db.exec(sql);
	assert.deepEqual((await db.query('select "isOnMailingList" from public.person')).rows, [{ isOnMailingList: false }]);
	await db.close();
});

test('the course cutoff counts today as the first of the days', () => {
	assert.equal(courseCutoff(today, 1), '2026-11-14');
	assert.equal(courseCutoff(today, 14), '2026-11-01');
	assert.equal(courseCutoff('2026-03-01', 29), '2026-02-01');
});

test('without filters everyone with a valid email is exported', () => {
	assert.deepEqual(emails({ members: false, courseDays: null }),
		['anna@example.com', 'bert@example.com', 'clara@example.com', 'dora@example.com']);
});

test('members only', () => {
	assert.deepEqual(emails({ members: true, courseDays: null }), ['anna@example.com', 'dora@example.com']);
});

test('course attendees of the last days only', () => {
	assert.deepEqual(emails({ members: false, courseDays: 14 }), ['bert@example.com']);
	assert.deepEqual(emails({ members: false, courseDays: 13 }), []);
	assert.deepEqual(emails({ members: false, courseDays: 365 }),
		['bert@example.com', 'clara@example.com', 'dora@example.com']);
});

test('members plus course attendees is the union of both', () => {
	assert.deepEqual(emails({ members: true, courseDays: 30 }),
		['anna@example.com', 'bert@example.com', 'dora@example.com']);
});

test('persons sharing an email become one entry', () => {
	const family = [
		person(1, 'Max', 'Familie@example.com', false, '2026-09-01'),
		person(2, 'Moritz', ' familie@example.com ', true, '2026-11-10')
	];
	assert.deepEqual(buildMailingList(family, { members: false, courseDays: null }, today), [
		{ email: 'Familie@example.com', names: ['Max Muster', 'Moritz Muster'], isMember: true, lastCourseDate: '2026-11-10' }
	]);
	assert.equal(buildMailingList(family, { members: true, courseDays: null }, today)[0].names.length, 1);
});

test('the CSV opens in Excel with German settings', () => {
	const csv = toCsv(buildMailingList([person(1, 'Anna; "Anni"', 'anna@example.com', true, '2026-11-01')],
		{ members: false, courseDays: null }, today));
	assert.equal(csv, '﻿Name;Email;Mitglied;Letzter Kurs\r\n"Anna; ""Anni"" Muster";anna@example.com;ja;2026-11-01\r\n');
});
