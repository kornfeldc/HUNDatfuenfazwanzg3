import type { IPersonWithHistory } from '$lib/data/hfzApi';

/** Attendance is a calendar day in the school's timezone, never a browser-local timestamp. */
export function attendanceToday(now = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Vienna',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
}

export function shiftAttendanceDay(day: string, days: number): string {
	const date = new Date(`${day}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

export function isAttendanceDay(value: unknown, today = attendanceToday()): value is string {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return (
		!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value <= today
	);
}

export function historyDay(date: Date): string {
	// SQL dates are mapped to UTC midnight by the existing API.
	return date.toISOString().slice(0, 10);
}

export function attendanceEntries(person: IPersonWithHistory, day: string) {
	return person.courseHistory.filter(
		(entry) => entry.courses < 0 && historyDay(entry.date) === day
	);
}

export function attendanceCount(person: IPersonWithHistory, day: string): number {
	return attendanceEntries(person, day).reduce((sum, entry) => sum - entry.courses, 0);
}

export function matchesAttendanceSearch(person: IPersonWithHistory, query: string): boolean {
	const text =
		`${person.lastName ?? ''} ${person.firstName ?? ''} ${person.dogNames ?? ''}`.toLocaleLowerCase(
			'de'
		);
	return query
		.trim()
		.toLocaleLowerCase('de')
		.split(/\s+/)
		.every((word) => text.includes(word));
}

export function rankAttendancePersons(persons: IPersonWithHistory[], today: string) {
	const threshold = shiftAttendanceDay(today, -89);
	const scores = persons.map((person) => {
		const days = person.courseHistory
			.filter((entry) => entry.courses < 0)
			.map((entry) => historyDay(entry.date))
			.filter((day) => day <= today);
		return {
			person,
			frequency: new Set(days.filter((day) => day >= threshold)).size,
			latest: days.reduce((latest, day) => (day > latest ? day : latest), ''),
			name: `${person.lastName ?? ''} ${person.firstName ?? ''}`.trim()
		};
	});
	return scores
		.sort(
			(a, b) =>
				b.frequency - a.frequency ||
				b.latest.localeCompare(a.latest) ||
				a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }) ||
				a.person.id - b.person.id
		)
		.map(({ person }) => person);
}
