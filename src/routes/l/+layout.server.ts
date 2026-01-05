import {HfzApi} from "$lib/data/hfzApi";

export async function load({locals}) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    return {
        hfzUser: await api.getUser()
    };
}
