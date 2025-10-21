import {HfzApi} from "$lib/data/hfzApi";
import moment from "moment";

export async function load({ cookies, params, url }) {
    const api = HfzApi.create();
    const date = url.searchParams.get("date") ?? moment().format("YYYY-MM-DD");
    console.log("date", date);
    
    return {
        sales: api.getSales(date),
        articles: api.getArticles()
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
