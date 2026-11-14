import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler, parseEvents, unfold } from '../supabase/functions/events/index.ts';

const event = (lines) => ['BEGIN:VEVENT', ...lines, 'END:VEVENT'].join('\r\n');
const calendar = (...events) =>
	['BEGIN:VCALENDAR', 'X-WR-TIMEZONE:Europe/Vienna', ...events, 'END:VCALENDAR'].join('\r\n') + '\r\n';
const now = new Date('2026-06-01T10:00:00Z');

const funTurnier = event([
	'DTSTART:20260620T070000Z',
	'DTEND:20260620T120000Z',
	'DESCRIPTION:Startgebühr 10 Euro\\, Anmeldung per E-Mail.<br><br>Wir freuen uns.',
	'LOCATION:SVÖ OG 125\\, Sulzhof\\, 7062 St. Margarethen',
	'STATUS:CONFIRMED',
	'SUMMARY:Fun-Turnier'
]);
const course = event([
	'DTSTART;TZID=Europe/Vienna:20260905T150000',
	'DTEND;TZID=Europe/Vienna:20260905T160000',
	'RRULE:FREQ=WEEKLY;COUNT=10',
	'DESCRIPTION:Kurs',
	'SUMMARY:Begleithundekurs'
]);

test('only single entries with a description count as events', () => {
	const ics = calendar(
		funTurnier,
		course,
		event(['DTSTART:20260701T070000Z', 'DTEND:20260701T080000Z', 'SUMMARY:Kursbeginn']),
		event(['DTSTART:20260702T070000Z', 'RECURRENCE-ID:20260702T070000Z', 'DESCRIPTION:Verschoben', 'SUMMARY:Kurs']),
		event(['DTSTART:20260703T070000Z', 'STATUS:CANCELLED', 'DESCRIPTION:Fällt aus', 'SUMMARY:Abgesagt'])
	);
	assert.deepEqual(parseEvents(ics, now), [
		{
			title: 'Fun-Turnier',
			description: 'Startgebühr 10 Euro, Anmeldung per E-Mail.<br><br>Wir freuen uns.',
			location: 'SVÖ OG 125, Sulzhof, 7062 St. Margarethen',
			start: '2026-06-20T07:00:00Z',
			end: '2026-06-20T12:00:00Z',
			allDay: false
		}
	]);
});

test('local times get the Vienna offset, also across daylight saving time', () => {
	const ics = calendar(
		event(['DTSTART;TZID=Europe/Vienna:20261213T170000', 'DTEND;TZID=Europe/Vienna:20261213T233000', 'DESCRIPTION:x', 'SUMMARY:Weihnachtsfeier']),
		event(['DTSTART:20260704T180000', 'DESCRIPTION:x', 'SUMMARY:Sommerfest'])
	);
	const [summer, winter] = parseEvents(ics, now);
	assert.deepEqual([summer.start, summer.end], ['2026-07-04T16:00:00Z', '2026-07-04T16:00:00Z']);
	assert.deepEqual([winter.start, winter.end], ['2026-12-13T16:00:00Z', '2026-12-13T22:30:00Z']);
});

test('all-day events keep their days, with an inclusive end', () => {
	const ics = calendar(
		event(['DTSTART;VALUE=DATE:20261027', 'DTEND;VALUE=DATE:20261029', 'DESCRIPTION:x', 'SUMMARY:Landesmeisterschaft']),
		event(['DTSTART;VALUE=DATE:20260601', 'DTEND;VALUE=DATE:20260602', 'DESCRIPTION:x', 'SUMMARY:Heute'])
	);
	assert.deepEqual(
		parseEvents(ics, now).map((e) => [e.title, e.start, e.end, e.allDay]),
		[
			['Heute', '2026-06-01', '2026-06-01', true],
			['Landesmeisterschaft', '2026-10-27', '2026-10-28', true]
		]
	);
});

test('events disappear once they have ended, not when they start', () => {
	const running = event(['DTSTART:20260601T080000Z', 'DTEND:20260601T120000Z', 'DESCRIPTION:x', 'SUMMARY:Läuft']);
	const over = event(['DTSTART:20260531T080000Z', 'DTEND:20260531T120000Z', 'DESCRIPTION:x', 'SUMMARY:Vorbei']);
	assert.deepEqual(parseEvents(calendar(over, running), now).map((e) => e.title), ['Läuft']);
});

test('folded lines are joined, even inside a multi-byte character', () => {
	const bytes = new TextEncoder().encode('DESCRIPTION:Anmeldung für das Fun-Turnier');
	const split = bytes.indexOf(0xc3) + 1; // between the two bytes of "ü"
	const folded = new Uint8Array([...bytes.slice(0, split), 13, 10, 32, ...bytes.slice(split)]);
	assert.equal(unfold(folded), 'DESCRIPTION:Anmeldung für das Fun-Turnier');
});

test('the function serves the calendar of a known og with CORS headers', async () => {
	// The handler filters by the real current time, so the event has to lie in the future
	const future = event(['DTSTART:20990620T070000Z', 'DTEND:20990620T120000Z', 'DESCRIPTION:x', 'SUMMARY:Jubiläum']);
	const feed = new TextEncoder().encode(calendar(funTurnier, future, course));
	let calls = 0;
	const fakeFetch = async (url) => {
		calls++;
		assert.match(url, /calendar\/ical\/95bamj1u8gd53v12ljhneqiou4%40group\.calendar\.google\.com\/public\/basic\.ics$/);
		return new Response(feed);
	};

	const res = await handler(new Request('https://x.supabase.co/functions/v1/events?og=125'), fakeFetch);
	assert.equal(res.status, 200);
	assert.equal(res.headers.get('access-control-allow-origin'), '*');
	assert.deepEqual((await res.json()).map((e) => [e.title, e.start]), [['Jubiläum', '2099-06-20T07:00:00Z']]);

	await handler(new Request('https://x.supabase.co/functions/v1/events?og=125'), fakeFetch);
	assert.equal(calls, 1, 'the feed is cached between requests');

	assert.equal((await handler(new Request('https://x.supabase.co/functions/v1/events?og=2'), fakeFetch)).status, 404);
	assert.equal((await handler(new Request('https://x', { method: 'OPTIONS' }), fakeFetch)).status, 204);
});
