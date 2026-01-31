import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({cookies, params, url, locals}) {
    const {id} = params;
    if (!id) return {title: 'Neuer Artikel'};
    const api = HfzApi.create(locals.supabase, locals.og!);
    try {
        return {
            article: await api.getArticle({id: parseInt(id)})
        };
    } catch (e) {
        throw redirect(303, "/l/modules/articles");
    }
}

export const actions = {
    default: async ({cookies, request, params, locals}) => {
        const {id} = params; // Extract the `id` parameter from the `params` object
        const formData = await request.formData();
        const api = HfzApi.create(locals.supabase, locals.og!);

        if (formData.get('deleteAction')) {
            try {
                if (id) await api.deleteArticle({id: parseInt(id)});
            } catch (e: any) {
                console.error("Delete article error", e);
                return fail(422, {
                    error: "Artikel konnte nicht gelöscht werden. Evtl. ist er noch mit Verkäufen verknüpft."
                });
            }
            throw redirect(303, "/l/modules/articles");
        }

        const redirectTo = formData.get('redirectTo')?.toString() ?? "/l/modules/articles";
        formData.delete('redirectTo');

        let data = Util.parseFormData(formData, [
                {
                    properties: ["price"],
                    method: (value: any) => Util.parseLocalizedFloat(value)
                },
                {
                    properties: ["isFavorite", "isActive"],
                    method: (value: any) => value === 'true' || value === 'on'
                }
            ]);
        if(id)
            data.id = parseInt(id);
        console.log("parsed data", data);

        try {
            if (id) await api.updateArticle(data as any);
            else await api.createArticle(data as any);
        } catch (e: any) {
            return fail(422, {
                error: e.message
            });
        }

        throw redirect(303, redirectTo);

        // const redirectTo = formData.get('redirectTo')!.toString();
        // formData.delete('redirectTo');
        //
        // if (!formData.get('companyId')) formData.delete('companyId');
        //
        // try {
        //     const ngData = new NgData(cookies);
        //     if (id) await ngData.updatePerson(id, formData);
        //     else await ngData.createPerson(formData);
        // } catch (e: any) {
        //     return fail(422, {
        //         error: e.message
        //     });
        // }
        // throw redirect(303, redirectTo);
    }
};
