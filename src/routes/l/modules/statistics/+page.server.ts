import {HfzApi} from "$lib/data/hfzApi";

export async function load({ cookies, params, url, locals }) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    const filter = url.searchParams.get("filter") ?? "all";
    
    return {
        years: await api.getAvailableYears(),
        articleStats: await api.getStatisticsArticles(filter),
        saleStats: await api.getStatisticsSales(filter),
        personStats: await api.getStatisticsPersonSales(filter)
    };
}
