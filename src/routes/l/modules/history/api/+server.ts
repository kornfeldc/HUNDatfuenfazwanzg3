import {json} from '@sveltejs/kit';
import {HfzApi} from "$lib/data/hfzApi";

export async function GET({url, locals}) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    const requestedLimit = Number(url.searchParams.get('limit') ?? '50');
    const offset = Number(url.searchParams.get('offset') ?? '0');
    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    const history = await api.getHistoryPage(limit + 1, Number.isFinite(offset) ? offset : 0);

    return json({
        history: history.slice(0, limit),
        hasMore: history.length > limit
    });
}
