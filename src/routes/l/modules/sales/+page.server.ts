import {HfzApi} from "$lib/data/hfzApi";
import moment from "moment";

export async function load({ cookies, params, url }) {
    const api = HfzApi.create();
    const date = url.searchParams.get("date") ?? moment().format("YYYY-MM-DD");
    return {
        sales: api.getSales(date),
        articles: api.getArticles()
    };
}
