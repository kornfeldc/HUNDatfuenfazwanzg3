// Builds the mailing list export: persons who opted in ("Auf Mailing-Liste") and have an email,
// optionally narrowed to members and/or persons who attended a course in the last days.

export interface IMailingListPerson {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
    isMember: boolean;
    lastCourseDate: string | null; // YYYY-MM-DD of the last attended course
}

export interface IMailingListFilter {
    members: boolean;
    courseDays: number | null; // null = no course filter
}

export interface IMailingListEntry {
    email: string;
    names: Array<string>;
    isMember: boolean;
    lastCourseDate: string | null;
}

/** The first day (YYYY-MM-DD) that still counts as "in the last `days` days", today included. */
export function courseCutoff(today: string, days: number): string {
    const date = new Date(today + "T00:00:00Z");
    date.setUTCDate(date.getUTCDate() - Math.max(0, Math.floor(days) - 1));
    return date.toISOString().substring(0, 10);
}

/**
 * Without a filter everyone opted in is exported. With filters a person needs to match one of them,
 * so members + course attendees is the union of both groups. Persons sharing an email (families)
 * become one entry.
 */
export function buildMailingList(persons: Array<IMailingListPerson>, filter: IMailingListFilter, today: string): Array<IMailingListEntry> {
    const cutoff = filter.courseDays ? courseCutoff(today, filter.courseDays) : null;
    const hasFilter = filter.members || !!cutoff;
    const entries = new Map<string, IMailingListEntry>();

    for (const person of persons) {
        const email = person.email?.trim() ?? "";
        if (!email.includes("@")) continue;

        const isCourseActive = !!cutoff && !!person.lastCourseDate && person.lastCourseDate >= cutoff;
        if (hasFilter && !(filter.members && person.isMember) && !isCourseActive) continue;

        const name = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
        const key = email.toLowerCase();
        const entry = entries.get(key);
        if (!entry) {
            entries.set(key, {email, names: [name], isMember: person.isMember, lastCourseDate: person.lastCourseDate});
            continue;
        }
        entry.names.push(name);
        entry.isMember ||= person.isMember;
        if (person.lastCourseDate && (!entry.lastCourseDate || person.lastCourseDate > entry.lastCourseDate))
            entry.lastCourseDate = person.lastCourseDate;
    }

    return [...entries.values()].sort((a, b) => a.names[0].localeCompare(b.names[0], "de"));
}

/** Semicolon separated with a BOM, so Excel with German settings opens it directly. */
export function toCsv(entries: Array<IMailingListEntry>): string {
    const cell = (value: string) => /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    const rows = [
        ["Name", "Email", "Mitglied", "Letzter Kurs"],
        ...entries.map(e => [e.names.join(", "), e.email, e.isMember ? "ja" : "nein", e.lastCourseDate ?? ""])
    ];
    return "﻿" + rows.map(row => row.map(cell).join(";")).join("\r\n") + "\r\n";
}
