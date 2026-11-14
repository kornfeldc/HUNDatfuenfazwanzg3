import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";
import {isAlbumLink, sizeCoverUrl} from "$lib/googlePhotos";

export async function load({params, locals}) {
    const {id} = params;
    if (!id) return {title: 'Neues Album'};
    const api = HfzApi.create(locals.supabase, locals.og!);
    try {
        return {
            album: await api.getAlbum({id: parseInt(id)})
        };
    } catch (e) {
        throw redirect(303, "/l/modules/albums");
    }
}

export const actions = {
    default: async ({request, params, locals}) => {
        const {id} = params;
        const formData = await request.formData();
        const api = HfzApi.create(locals.supabase, locals.og!);

        if (formData.get('deleteAction')) {
            try {
                if (id) await api.deleteAlbum({id: parseInt(id)});
            } catch (e: any) {
                console.error("Delete album error", e);
                return fail(422, {error: "Album konnte nicht gelöscht werden."});
            }
            throw redirect(303, "/l/modules/albums");
        }

        const redirectTo = formData.get('redirectTo')?.toString() ?? "/l/modules/albums";
        formData.delete('redirectTo');

        // date stays a YYYY-MM-DD string, so it is stored as that calendar day regardless of time zone
        let data = Util.parseFormData(formData, [
            {
                properties: ["isPublished"],
                method: (value: any) => value === 'true' || value === 'on'
            },
            {
                properties: ["title", "link", "coverUrl", "dateText"],
                method: (value: any) => value?.toString().trim() ?? ''
            }
        ]);
        if (!data.title) return fail(422, {error: "Bitte einen Titel eingeben."});
        if (!data.date) return fail(422, {error: "Bitte ein Datum eingeben."});
        if (!isAlbumLink(data.link)) return fail(422, {error: "Bitte einen Google Fotos Link (photos.app.goo.gl/…) eingeben."});
        data.dateText = data.dateText || null;
        data.coverUrl = sizeCoverUrl(data.coverUrl);
        if (id)
            data.id = parseInt(id);

        try {
            if (id) await api.updateAlbum(data as any);
            else await api.createAlbum(data as any);
        } catch (e: any) {
            return fail(422, {
                error: e.message
            });
        }

        throw redirect(303, redirectTo);
    }
};
