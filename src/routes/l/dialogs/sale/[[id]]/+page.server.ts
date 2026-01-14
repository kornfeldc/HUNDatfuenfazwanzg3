import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({cookies, params, url, locals}) {
    const {id} = params;
    const api = HfzApi.create(locals.supabase, locals.og!);
    if (!id) {
        const personId = url.searchParams.get('personId');
        const param = personId ? {id: parseInt(personId ?? -1)} : undefined;
        return {
            sale: api.getNewSaleForPerson(param),
            topSoldArticles: api.getTopSoldArticles(param),
            articles: api.getArticles()
        };
    }

    return {
        sale: api.getSale({id: parseInt(id)}),
        topSoldArticles: api.getTopSoldArticlesBySaleId({id: parseInt(id)}),
        articles: api.getArticles()
    };
}

export const actions = {
    default: async ({cookies, request, params, locals}) => {
        const {id} = params; // Extract the `id` parameter from the `params` object
        const api = HfzApi.create(locals.supabase, locals.og!);
        const formData = await request.formData();

        if (formData.get('deleteAction')) {
            if (id) await api.deleteSale({id: parseInt(id)});
            throw redirect(303, "/l/modules/sales");
        }

        let redirectTo = formData.get('redirectTo')?.toString() ?? "/l/modules/sales";
        formData.delete('redirectTo');

        let data = Util.parseFormData(formData, [
            {properties: ['saleArticles'], method: (val) => JSON.parse(val)},
            {properties: ['saleSum'], method: (val) => parseFloat(val)},
            {properties: ['personId'], method: (val) => parseInt(val)}
        ]);
        
        if (id) {
            data.id = parseInt(id);
            redirectTo = redirectTo.replace("//", `/${id}/`);
        }
        
        console.log("parsed data", data);

        try {
            const saleToSave = {
                id: data.id ?? 0,
                articleSum: data.articleSum,
                saleArticles: data.saleArticles,
                person: data.personId ? {id: data.personId} : undefined
            } as any;
            const saleSaved = await api.saveSale(saleToSave);
            redirectTo = redirectTo.replace("//", `/${saleSaved.id}/`);
        } catch (e: any) {
            return fail(422, {
                error: e.message
            });
        }

        throw redirect(303, redirectTo);
    }
};
