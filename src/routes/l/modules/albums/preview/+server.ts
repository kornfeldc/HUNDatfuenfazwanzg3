import {error, json} from '@sveltejs/kit';
import {fetchAlbumPreview, isAlbumLink} from "$lib/googlePhotos";

// Title, date and cover suggested for a Google Photos share link, used by the album dialog.
export async function GET({url, fetch}) {
    const link = url.searchParams.get('link')?.trim() ?? '';
    if (!isAlbumLink(link)) throw error(400, 'Bitte einen Google Fotos Link (photos.app.goo.gl/…) eingeben.');

    const preview = await fetchAlbumPreview(link, fetch).catch(() => null);
    if (!preview) throw error(422, 'Das Album konnte nicht gelesen werden. Ist es freigegeben?');
    return json(preview);
}
