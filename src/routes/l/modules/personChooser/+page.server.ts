import {HfzApi} from "$lib/data/hfzApi";

export async function load({ cookies, params, url, locals }) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    return {
        topPersons: api.getTopPersonsBySales(),
        persons: api.getPersons() 
    };
}
