import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({cookies, params, url}) {
    const {id} = params;
    if(!id) return fail(404, "No id");
    
    const api = HfzApi.create();
    return {
        person: api.getPerson({id: parseInt(id)})
    };
}

export const actions = {
    default: async ({cookies, request, params}) => {
        const {id} = params; // Extract the `id` parameter from the `params` object
    }
};
