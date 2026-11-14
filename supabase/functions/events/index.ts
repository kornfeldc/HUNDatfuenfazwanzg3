// Supabase Edge Function "events": the upcoming Veranstaltungen of an Ortsgruppe, read from its public
// Google Calendar, for the homepage (svoe.og125.at). Browsers cannot read the calendar feed themselves
// (Google sends no CORS header), and going through Supabase keeps visitors' IP addresses away from Google.
//
// The calendar mixes course dates and events. Course dates are recurring series; an event is a single
// entry with a description. Deployed without JWT verification: it only returns public calendar data.
//
// GET /functions/v1/events?og=125 → [{title, description, location, start, end, allDay}], sorted by start.
// start/end are ISO timestamps, or YYYY-MM-DD days for all-day events (end inclusive).
// Self-contained (no imports), so it can be pasted into the Supabase dashboard; tests/events-function.test.mjs runs it in Node.

export interface ICalendarEvent {
    title: string;
    description: string;
    location: string;
    start: string;
    end: string;
    allDay: boolean;
}

const calendars: Record<number, string> = {
    125: "95bamj1u8gd53v12ljhneqiou4@group.calendar.google.com",
};

const feedUrl = (calendarId: string) =>
    `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;

/** Joins folded lines (CRLF + space). Works on bytes, as a fold may split a multi-byte UTF-8 character. */
export function unfold(bytes: Uint8Array): string {
    const out: number[] = [];
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 13 && bytes[i + 1] === 10 && (bytes[i + 2] === 32 || bytes[i + 2] === 9)) {
            i += 2;
            continue;
        }
        if (bytes[i] === 10 && (bytes[i + 1] === 32 || bytes[i + 1] === 9)) {
            i += 1;
            continue;
        }
        out.push(bytes[i]);
    }
    return new TextDecoder().decode(new Uint8Array(out));
}

const unescapeText = (value: string) =>
    value.replace(/\\([\\;,nN])/g, (_, c) => (c === "n" || c === "N" ? "\n" : c));

interface IProperty {
    params: Record<string, string>;
    value: string;
}

function parseProperties(block: string): Record<string, IProperty> {
    const props: Record<string, IProperty> = {};
    for (const line of block.split(/\r?\n/)) {
        const colon = line.indexOf(":");
        if (colon < 0) continue;
        const [name, ...params] = line.slice(0, colon).split(";");
        props[name.toUpperCase()] = {
            params: Object.fromEntries(params.map((p) => p.split("=") as [string, string])),
            value: line.slice(colon + 1),
        };
    }
    return props;
}

/** Offset of a time zone from UTC at the given instant, in milliseconds. */
function zoneOffset(utc: number, timeZone: string): number {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
            timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
        }).formatToParts(new Date(utc)).map((p) => [p.type, p.value]),
    );
    return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second) - utc;
}

/** Converts a DTSTART/DTEND property to an ISO timestamp, or to a YYYY-MM-DD day for all-day values. */
function toIso(prop: IProperty, defaultZone: string): { value: string; allDay: boolean } {
    const m = prop.value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
    if (!m) throw new Error(`Unexpected date: ${prop.value}`);
    const [, y, mo, d, h, mi, s, z] = m;
    if (h === undefined) return { value: `${y}-${mo}-${d}`, allDay: true };
    const wall = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
    if (z) return { value: new Date(wall).toISOString().replace(".000", ""), allDay: false };
    // Wall-clock time in a time zone: subtract the zone's offset, re-checked once around DST changes
    const zone = prop.params.TZID ?? defaultZone;
    let utc = wall - zoneOffset(wall, zone);
    utc = wall - zoneOffset(utc, zone);
    return { value: new Date(utc).toISOString().replace(".000", ""), allDay: false };
}

const previousDay = (day: string) => new Date(Date.parse(`${day}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);

/** The events (single entries with a description) of an iCal feed that have not ended at `now`. */
export function parseEvents(ics: string, now = new Date()): ICalendarEvent[] {
    const defaultZone = ics.match(/^X-WR-TIMEZONE:(.+)$/m)?.[1].trim() ?? "Europe/Vienna";
    const today = now.toISOString().slice(0, 10);
    const events: ICalendarEvent[] = [];

    for (const [, block] of ics.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)END:VEVENT/g)) {
        const p = parseProperties(block);
        if (p.RRULE || p["RECURRENCE-ID"] || p.STATUS?.value === "CANCELLED" || !p.DTSTART) continue;
        const description = unescapeText(p.DESCRIPTION?.value ?? "").trim();
        if (!description) continue;

        const start = toIso(p.DTSTART, defaultZone);
        let end = p.DTEND ? toIso(p.DTEND, defaultZone) : start;
        // All-day DTEND is the day after the event
        if (end.allDay && p.DTEND) end = { ...end, value: previousDay(end.value) };
        if (end.allDay !== start.allDay || end.value < start.value) end = start;

        const ended = start.allDay ? end.value < today : Date.parse(end.value) < now.getTime();
        if (ended) continue;

        events.push({
            title: unescapeText(p.SUMMARY?.value ?? "").trim(),
            description,
            location: unescapeText(p.LOCATION?.value ?? "").trim(),
            start: start.value,
            end: end.value,
            allDay: start.allDay,
        });
    }

    // All-day starts sort as midnight UTC of their day
    const key = (e: ICalendarEvent) => Date.parse(e.allDay ? `${e.start}T00:00:00Z` : e.start);
    return events.sort((a, b) => key(a) - key(b));
}

const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, apikey, content-type" };
const cache = new Map<number, { at: number; events: ICalendarEvent[] }>();
const cacheMs = 5 * 60 * 1000;

export async function handler(req: Request, fetchFn: typeof fetch = fetch): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const og = Number(new URL(req.url).searchParams.get("og"));
    const calendarId = calendars[og];
    if (!calendarId) return Response.json({ error: "Unknown og" }, { status: 404, headers: cors });

    let cached = cache.get(og);
    if (!cached || Date.now() - cached.at > cacheMs) {
        const res = await fetchFn(feedUrl(calendarId));
        if (res.ok) {
            cached = { at: Date.now(), events: parseEvents(unfold(new Uint8Array(await res.arrayBuffer()))) };
            cache.set(og, cached);
        } else if (!cached) {
            return Response.json({ error: `Calendar feed returned ${res.status}` }, { status: 502, headers: cors });
        }
        // else: Google is unreachable, keep serving the last events
    }

    return Response.json(cached.events, {
        headers: { ...cors, "cache-control": "public, max-age=300" },
    });
}

// Deno (Supabase) starts the server; in Node tests the module only exports its functions.
(globalThis as any).Deno?.serve((req: Request) => handler(req));
