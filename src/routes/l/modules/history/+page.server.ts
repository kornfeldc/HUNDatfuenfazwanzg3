import {HfzApi} from "$lib/data/hfzApi";

export async function load({locals}) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    const limit = 50;

    return {
        initialHistory: api.getHistoryPage(limit, 0),
        limit
    };
}
