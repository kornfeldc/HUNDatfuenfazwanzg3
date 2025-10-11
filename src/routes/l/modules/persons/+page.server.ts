import {HfzApi} from "$lib/data/hfzApi";

export async function load({ cookies, params, url }) {
    const api = HfzApi.create();
    return {
        persons: api.getPersons() 
    };
    // const { id } = params; // Extract the `id` parameter from the `params` object
    // const companyId = url.searchParams.get('companyId');
    // const queryId = companyId ?? id;
    //
    // const ngData = new NgData(cookies);
    // return {
    //     employees: ngData.getContacts({ companyId: parseInt(queryId) }),
    //     contact: ngData.getContact({ id: parseInt(queryId) })
    // };
}
