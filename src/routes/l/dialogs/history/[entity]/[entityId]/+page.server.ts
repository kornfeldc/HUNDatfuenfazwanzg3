import {HfzApi} from "$lib/data/hfzApi";
import {fail} from "@sveltejs/kit";

export async function load({params, locals}) {
    const {entity, entityId} = params;
    if (!entity || !entityId) return fail(404, "Not found");

    const api = HfzApi.create(locals.supabase, locals.og!);
    
    let title = "";
    switch(entity) {
        case 'person':
            const person = await api.getPerson({id: parseInt(entityId)});
            title = `Historie für ${person.firstName} ${person.lastName}`;
            break;
        case 'sale':
            title = `Historie für Verkauf #${entityId}`;
            break;
        case 'article':
            const article = await api.getArticle({id: parseInt(entityId)});
            title = `Historie für ${article.title}`;
            break;
        default:
            title = `Historie für ${entity} #${entityId}`;
    }

    return {
        history: api.getHistory(entity, entityId),
        title
    };
}
