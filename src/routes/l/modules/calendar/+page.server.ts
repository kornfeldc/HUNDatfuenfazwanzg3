import {HfzApi} from "$lib/data/hfzApi";

export async function load({ cookies, params, url }) {
    const api = HfzApi.create();
    return {
        sales: api.getSales() 
    };
}
