import {HfzApi} from "$lib/data/hfzApi";
import moment from "moment";

export async function load({ cookies, params, url, locals }) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    const date = url.searchParams.get("date") ?? moment().format("YYYY-MM-DD");
    return {
        sales: api.getSales(date),
        articles: api.getArticles()
    };
}

export const actions = {
    payWithCredit: async ({ request, locals }) => {
        const formData = await request.formData();
        const date = formData.get("date")?.toString();
        const api = HfzApi.create(locals.supabase, locals.og!);
        await api.paySalesWithCredit(date);
        return { success: true };
    }
}
