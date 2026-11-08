import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Compile the pure helper with the project's TypeScript version, including on Node 20.
const { outputText } = ts.transpileModule(
	await readFile(new URL('../src/lib/components/course/attendance.ts', import.meta.url), 'utf8'),
	{ compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }
);
const {
	attendanceToday,
	shiftAttendanceDay,
	isAttendanceDay,
	attendanceCount,
	matchesAttendanceSearch,
	rankAttendancePersons
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const person = (id, lastName, entries = []) => ({
	id,
	lastName,
	firstName: 'Anna',
	dogNames: 'Luna',
	courseHistory: entries.map(([date, courses], i) => ({
		id: i + 1,
		date: new Date(`${date}T00:00:00Z`),
		courses
	}))
});

test('calendar days stay correct across Vienna midnight and daylight-saving changes', () => {
	assert.equal(attendanceToday(new Date('2026-11-07T23:30:00Z')), '2026-11-08');
	assert.equal(attendanceToday(new Date('2026-07-07T22:30:00Z')), '2026-07-08');
	assert.equal(shiftAttendanceDay('2026-03-30', -1), '2026-03-29');
	assert.equal(shiftAttendanceDay('2026-10-26', -1), '2026-10-25');
});

test('date validation rejects impossible, malformed, and future days', () => {
	for (const value of ['2026-02-30', '2026-13-01', '08.11.2026', '', null, '2026-11-09']) {
		assert.equal(isAttendanceDay(value, '2026-11-08'), false, String(value));
	}
	assert.equal(isAttendanceDay('2024-02-29', '2026-11-08'), true);
});

test('attendance counts negative units, excluding purchases, other days, and reversed rows', () => {
	const p = person(1, 'Müller', [
		['2026-11-07', -2],
		['2026-11-07', 10],
		['2026-11-08', -1],
		['2026-11-07', 0]
	]);
	assert.equal(attendanceCount(p, '2026-11-07'), 2);
});

test('regulars sort by distinct attendance days, then recency, then name', () => {
	const regular = person(1, 'Zulu', [
		['2026-11-01', -1],
		['2026-11-02', -1]
	]);
	const double = person(2, 'Alpha', [
		['2026-11-07', -2],
		['2026-11-07', -1]
	]);
	const recent = person(3, 'Beta', [['2026-11-08', -1]]);
	const purchase = person(4, 'Aardvark', [['2026-11-08', 100]]);
	const older = person(5, 'Older', [['2026-01-01', -50]]);
	const newcomer = person(6, 'Zebra');
	assert.deepEqual(
		rankAttendancePersons([purchase, newcomer, double, recent, older, regular], '2026-11-08').map(
			(p) => p.id
		),
		[1, 3, 2, 5, 4, 6]
	);
});

test('90-day ranking includes its first day but excludes older and future attendance', () => {
	const firstDay = shiftAttendanceDay('2026-11-08', -89);
	const included = person(1, 'Z', [[firstDay, -1]]);
	const excluded = person(2, 'A', [
		[shiftAttendanceDay(firstDay, -1), -1],
		['2026-11-09', -1]
	]);
	assert.deepEqual(
		rankAttendancePersons([excluded, included], '2026-11-08').map((p) => p.id),
		[1, 2]
	);
});

test('search matches first name, surname and dog across words regardless of case', () => {
	const p = person(1, 'Müller');
	assert.equal(matchesAttendanceSearch(p, '  LUNA anna  '), true);
	assert.equal(matchesAttendanceSearch(p, 'müller'), true);
	assert.equal(matchesAttendanceSearch(p, 'missing'), false);
});
