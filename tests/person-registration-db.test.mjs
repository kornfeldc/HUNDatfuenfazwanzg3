import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

let db;
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const sql = await readFile(new URL('../supabase/migrations/20261115120000_person_registration.sql', import.meta.url), 'utf8');

const form = (overrides = {}) => ({
	og: 125, firstName: ' Anna ', lastName: 'Muster', birthDate: '1990-05-01', street: 'Hauptstraße 1',
	postalCode: '7062', city: 'St. Margarethen', phone: '0664 1234567', email: ' Anna@Example.com ',
	dogName: 'Rex', dogBreed: 'Labrador', dogSex: 'male', dogBirthDate: '2026-03-01', dogChipNumber: '040123',
	dogInsuranceNumber: ' 12/345 ', mailingList: true, referralSource: 'Google', acceptTerms: true,
	...overrides
});
const register = (f) => query(
	'select public.register_person($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)',
	[f.og, f.firstName, f.lastName, f.birthDate, f.street, f.postalCode, f.city, f.phone, f.email, f.dogName,
		f.dogBreed, f.dogSex, f.dogBirthDate, f.dogChipNumber, f.dogInsuranceNumber, f.mailingList,
		f.referralSource, f.acceptTerms]
);

before(async () => {
	db = new PGlite();
	await db.exec(`
		create role anon; create role authenticated;
		create table public.users (login text primary key, og integer);
		create table public.person (
			id serial primary key, og integer, "firstName" varchar not null, "lastName" varchar not null,
			"isMember" boolean not null, "mainPersonId" integer, "personGroup" varchar not null,
			credit double precision not null, "saleCount" integer not null, "saleSum" double precision not null,
			phone varchar, email varchar, "extId" varchar, "isActive" boolean, "saleCountActive" integer,
			"courseCount" integer not null default 0, "dogNames" varchar, info varchar,
			"isOnMailingList" boolean not null default false
		);
		create table public.history (
			id serial primary key, timestamp timestamptz default now(), "userEmail" text, action text,
			"entityType" text, "entityId" text, details text, og integer
		);
		alter table public.person enable row level security;
		alter table public.history enable row level security;
		-- Supabase grants anon the tables; RLS without an anon policy is what keeps it out.
		grant select, insert on public.person, public.history to anon;
		insert into public.person (og, "firstName", "lastName", "isMember", "personGroup", credit, "saleCount", "saleSum")
			values (125, 'Alt', 'Bestand', true, '', 0, 0, 0);
	`);
	await db.exec(sql);
	await db.exec(sql);
});

after(async () => {
	await db?.close();
});

beforeEach(async () => {
	await db.exec(`reset role; delete from public.person where "registeredAt" is not null; truncate public.history, public.users;
		insert into public.users values ('trainer@example.com', 125);`);
});

test('the migration keeps existing persons and can be rerun', async () => {
	assert.deepEqual(await query('select "firstName", "photoConsent", "registeredAt", "dogSex" from public.person'), [
		{ firstName: 'Alt', photoConsent: false, registeredAt: null, dogSex: null }
	]);
});

test('anonymous visitors register a person with all form fields', async () => {
	await db.exec('set role anon');
	await register(form());
	await db.exec('reset role');

	const [p] = await query(`select og, "firstName", "lastName", "birthDate"::text, street, "postalCode", city, phone, email,
		"dogNames", "dogBreed", "dogSex", "dogBirthDate"::text, "dogChipNumber", "dogInsuranceNumber", "isOnMailingList",
		"photoConsent", "referralSource", "registeredAt" is not null as registered, "isMember", "isActive", credit,
		"courseCount" from public.person where "registeredAt" is not null`);
	assert.deepEqual(p, {
		og: 125, firstName: 'Anna', lastName: 'Muster', birthDate: '1990-05-01', street: 'Hauptstraße 1',
		postalCode: '7062', city: 'St. Margarethen', phone: '0664 1234567', email: 'anna@example.com',
		dogNames: 'Rex', dogBreed: 'Labrador', dogSex: 'male', dogBirthDate: '2026-03-01', dogChipNumber: '040123',
		dogInsuranceNumber: '12/345', isOnMailingList: true, photoConsent: true, referralSource: 'Google',
		registered: true, isMember: false, isActive: true, credit: 0, courseCount: 0
	});
	assert.deepEqual(await query('select action, "entityType", details, og from public.history'), [
		{ action: 'register', entityType: 'person', details: 'Anna Muster', og: 125 }
	]);
});

test('anonymous visitors still cannot read or write persons directly', async () => {
	await db.exec('set role anon');
	assert.deepEqual(await query('select * from public.person'), []);
	await assert.rejects(query(`insert into public.person (og, "firstName", "lastName", "isMember", "personGroup", credit,
		"saleCount", "saleSum") values (125, 'x', 'y', false, '', 0, 0, 0)`));
});

test('invalid registrations are rejected', async () => {
	await db.exec('set role anon');
	for (const overrides of [
		{ og: 999 },
		{ acceptTerms: false },
		{ acceptTerms: null },
		{ firstName: '  ' },
		{ phone: null },
		{ street: ' ' },
		{ postalCode: null },
		{ city: '' },
		{ dogName: '' },
		{ dogChipNumber: ' ' },
		{ dogInsuranceNumber: null },
		{ email: 'kein-email' },
		{ dogSex: 'other' },
		{ birthDate: '2999-01-01' },
		{ dogBirthDate: '1900-01-01' },
		{ referralSource: 'x'.repeat(201) }
	]) {
		await assert.rejects(register(form(overrides)), undefined, JSON.stringify(overrides));
	}
	await db.exec('reset role');
	assert.equal((await query('select * from public.person where "registeredAt" is not null')).length, 0);
});

test('optional fields may stay empty', async () => {
	await db.exec('set role anon');
	await register(form({ birthDate: null, dogBreed: null, dogSex: null,
		dogBirthDate: null, mailingList: null, referralSource: ' ' }));
	await db.exec('reset role');
	assert.deepEqual(await query('select "birthDate", "dogBreed", "dogSex", "isOnMailingList", "photoConsent", "referralSource" from public.person where "registeredAt" is not null'), [
		{ birthDate: null, dogBreed: null, dogSex: null, isOnMailingList: false, photoConsent: true, referralSource: null }
	]);
});

test('at most 20 registrations per hour and Ortsgruppe', async () => {
	await db.exec('set role anon');
	for (let i = 0; i < 20; i++) await register(form());
	await assert.rejects(register(form()), /Too many registrations/);
});
