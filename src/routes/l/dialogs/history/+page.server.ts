import {HfzApi} from "$lib/data/hfzApi";
import {moment} from "$lib/util";

export async function load({url, locals}) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    const dateStr = url.searchParams.get("date") ?? moment().format("YYYY-MM-DD");
    const date = moment(dateStr).toDate();

    return {
        history: api.getHistoryByDay(date),
        paging: api.getPreviousNextDayWithHistory(date),
        date: dateStr
    };
}
