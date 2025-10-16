import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	// Temporary: redirect the root route to the sales module
	throw redirect(307, '/l/modules/sales');
};
