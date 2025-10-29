import {HfzApi} from "$lib/data/hfzApi";
import moment from "moment/moment";

export async function load({ cookies, params, url }) {
    const api = HfzApi.create();
    const date = url.searchParams.get("date") ?? moment().format("YYYY-MM-DD");
   
    const dateFrom = moment(date).startOf('month').add(-1, 'months').format("YYYY-MM-DD");
    const dateTo = moment(date).endOf('month').add(1, 'months').format("YYYY-MM-DD");
    
    return {
        sales: api.getSales(dateFrom, dateTo) 
    };
}
