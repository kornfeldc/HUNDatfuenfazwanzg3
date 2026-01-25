import {HfzApi} from "$lib/data/hfzApi";

export async function load({ cookies, params, url, locals }) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    return {
        persons: api.getPersonsWithCourseHistory(365) 
    };
}

export const actions = {
    deduct: async ({ request, locals }) => {
        const data = await request.formData();
        const personId = Number(data.get('personId'));
        const api = HfzApi.create(locals.supabase, locals.og!);
        await api.addPersonCourse({id: personId}, -1, new Date());
        return { success: true };
    }
};
