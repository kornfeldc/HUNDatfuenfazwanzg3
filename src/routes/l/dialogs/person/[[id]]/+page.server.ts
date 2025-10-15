import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({params}) => {
    // Temporary: redirect the root route to the sales module
    throw redirect(307, `/l/dialogs/person/${params.id}/data`);
};
