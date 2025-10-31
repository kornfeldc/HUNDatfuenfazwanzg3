import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({params}) => {
    const id = params.id;
    const target = id ? `/l/dialogs/person/${id}/data` : `/l/dialogs/person/data`;
    throw redirect(307, target);
};
