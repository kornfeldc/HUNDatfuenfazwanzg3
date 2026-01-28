import {HfzApi} from "$lib/data/hfzApi";

export async function load({ cookies, params, url, locals }) {
    const link = params.link;
    return {
        link
    };
}
