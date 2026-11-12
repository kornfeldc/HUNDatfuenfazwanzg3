import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({params, locals}) {
    const {id} = params;
    if (!id) return {title: 'Neue News'};
    const api = HfzApi.create(locals.supabase, locals.og!);
    try {
        return {
            news: await api.getNewsEntry({id: parseInt(id)})
        };
    } catch (e) {
        throw redirect(303, "/l/modules/news");
    }
}

export const actions = {
    default: async ({request, params, locals}) => {
        const {id} = params;
        const formData = await request.formData();
        const api = HfzApi.create(locals.supabase, locals.og!);

        if (formData.get('deleteAction')) {
            try {
                if (id) await api.deleteNews({id: parseInt(id)});
            } catch (e: any) {
                console.error("Delete news error", e);
                return fail(422, {error: "News konnte nicht gelöscht werden."});
            }
            throw redirect(303, "/l/modules/news");
        }

        const redirectTo = formData.get('redirectTo')?.toString() ?? "/l/modules/news";
        formData.delete('redirectTo');

        // date stays a YYYY-MM-DD string, so it is stored as that calendar day regardless of time zone
        let data = Util.parseFormData(formData, [
            {
                properties: ["isPublished"],
                method: (value: any) => value === 'true' || value === 'on'
            }
        ]);
        if (!data.title?.trim()) return fail(422, {error: "Bitte einen Titel eingeben."});
        if (!data.date) return fail(422, {error: "Bitte ein Datum eingeben."});
        if (id)
            data.id = parseInt(id);

        try {
            if (id) await api.updateNews(data as any);
            else await api.createNews(data as any);
        } catch (e: any) {
            return fail(422, {
                error: e.message
            });
        }

        throw redirect(303, redirectTo);
    }
};
