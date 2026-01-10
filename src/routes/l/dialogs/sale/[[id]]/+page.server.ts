import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({cookies, params, url, locals}) {
    const {id} = params;
    const api = HfzApi.create(locals.supabase, locals.og!);
    if (!id) {
        const personId = url.searchParams.get('personId');
        const param = personId ? {id: parseInt(personId ?? -1)} : { id: -1};
        
        return {
            sale: api.getNewSaleForPerson(param),
            articles: api.getArticles()
        };
    }
    return {
        sale: api.getSale({id: parseInt(id)}),
        articles: api.getArticles()
    };
}

export const actions = {
    default: async ({cookies, request, params}) => {
        const {id} = params; // Extract the `id` parameter from the `params` object
        const formData = await request.formData();

        const redirectTo = formData.get('redirectTo')?.toString() ?? "/l/modules/sales";
        formData.delete('redirectTo');

        let data = Util.parseFormData(formData, []);
        if (id)
            data.id = parseInt(id);
        console.log("parsed data", data);

        try {
            // todo - save data via api
        } catch (e: any) {
            return fail(422, {
                error: e.message
            });
        }

        throw redirect(303, redirectTo);
    }
};
