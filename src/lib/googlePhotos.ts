// Reads name, date and cover image of a shared Google Photos album from its public share page.
// Google offers no API for this any more, so this relies on the page's Open Graph tags:
// og:title looks like "20. Juni 2026 - Funturnier · Saturday, Jun 20 📸" (the part after "·" is
// the date range of the photos, in English because we ask for it) and og:image is the album cover.

export interface IAlbumPreview {
    title: string;
    date: string | null; // YYYY-MM-DD
    coverUrl: string;
}

const shareHosts = ["photos.app.goo.gl", "photos.google.com"];

const englishMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const germanMonths = ["jän", "feb", "mär", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "dez"];

/** True for links the server may fetch: share links of Google Photos albums only. */
export function isAlbumLink(link: string): boolean {
    try {
        const url = new URL(link);
        return url.protocol === "https:" &&
            (shareHosts.includes(url.hostname) || (url.hostname === "goo.gl" && url.pathname.startsWith("/photos/")));
    } catch {
        return false;
    }
}

/**
 * Sizes a Google Photos image URL for the gallery cards (4:3, 800×600 for sharp 2x screens).
 * Current URLs take the size after "="; old Picasa-style URLs (size as a path segment) are kept as they are.
 */
export function sizeCoverUrl(link: string): string {
    let url: URL;
    try {
        url = new URL(link.trim());
    } catch {
        return link.trim();
    }
    if (!url.hostname.endsWith(".googleusercontent.com")) return link.trim();
    if (!url.pathname.startsWith("/pw/") && url.pathname.split("/").length !== 2) return link.trim();
    return `${url.origin}${url.pathname.split("=")[0]}=w800-h600-p`;
}

const isoDate = (year: number, month: number, day: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

// "20. Juni 2026", "12.November 2022", "30. Nov. 2019", "27.-28. Oktober 2019", "4.10.2025"
const germanDate = /(\d{1,2})\.(?:\s*[-–]\s*\d{1,2}\.)?\s*(?:([a-zäöü]{3})[a-zäöü]*\.?|(\d{1,2})\.)\s*(\d{4})/i;

function parseGermanDate(text: string): string | null {
    const m = text.match(germanDate);
    if (!m) return null;
    const month = m[2] ? germanMonths.indexOf(m[2].toLowerCase().replace("jan", "jän")) + 1 : parseInt(m[3]);
    if (month < 1 || month > 12) return null;
    return isoDate(parseInt(m[4]), month, parseInt(m[1]));
}

// "Saturday, Oct 4, 2025", "Sep 28 – 29, 2019", "Saturday, Jun 20" (current year)
function parsePhotoDates(text: string, today: Date): string | null {
    const m = text.match(/\b([A-Z][a-z]{2}) (\d{1,2})\b/);
    if (!m || !englishMonths.includes(m[1])) return null;
    const month = englishMonths.indexOf(m[1]) + 1;
    const day = parseInt(m[2]);
    const year = text.match(/\b(\d{4})\b/)?.[1];
    if (year) return isoDate(parseInt(year), month, day);
    const date = isoDate(today.getFullYear(), month, day);
    return date > isoDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
        ? isoDate(today.getFullYear() - 1, month, day)
        : date;
}

function decodeEntities(text: string): string {
    return text
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
}

/**
 * Suggests title, date and cover from a share page. The club names albums like "20. Juni 2026 - Funturnier";
 * that date is preferred over the photo dates, which are off when a camera clock was wrong.
 */
export function parseAlbumPage(html: string, today = new Date()): IAlbumPreview | null {
    const meta = (property: string) =>
        html.match(new RegExp(`<meta property="og:${property}" content="([^"]*)"`))?.[1];
    const ogTitle = decodeEntities(meta("title") ?? "");
    const image = decodeEntities(meta("image") ?? "");
    if (!ogTitle || !image) return null;

    const [name, photoDates = ""] = ogTitle.split(" · ");
    const title = name
        .replace(new RegExp(`^${germanDate.source}\\s*[-–]\\s*`, "i"), "")
        .replace(/\s+\d{1,2}\.\d{1,2}\.\d{4}$/, "")
        .trim();

    return {
        title: title || name.trim(),
        date: parseGermanDate(name) ?? parsePhotoDates(photoDates, today),
        coverUrl: sizeCoverUrl(image)
    };
}

/** Loads the share page of an album. Only call it with links that pass `isAlbumLink`. */
export async function fetchAlbumPreview(link: string, fetchFn: typeof fetch = fetch): Promise<IAlbumPreview | null> {
    if (!isAlbumLink(link)) throw new Error("Kein Google Fotos Link");
    const res = await fetchFn(link, {headers: {"accept-language": "en"}});
    if (!res.ok || !isAlbumLink(res.url || link)) return null;
    return parseAlbumPage(await res.text());
}
