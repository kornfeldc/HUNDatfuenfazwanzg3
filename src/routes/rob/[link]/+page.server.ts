import {HfzApi} from "$lib/data/hfzApi";
import {error, fail} from "@sveltejs/kit";

export async function load({ params, locals }) {
    const { link } = params;
    const api = HfzApi.create(locals.supabase, 0);
    
    try {
        const robCourse = await api.getRobCourseByLink(link);
        return {
            robCourse
        };
    } catch (e) {
        throw error(404, 'Kurs nicht gefunden');
    }
}

export const actions = {
    default: async ({ request, params, locals }) => {
        const { link } = params;
        const formData = await request.formData();
        const personName = formData.get('personName')?.toString();
        const dogName = formData.get('dogName')?.toString();

        if (!personName || !dogName) {
            return fail(400, { message: 'Bitte alle Felder ausfüllen' });
        }

        const api = HfzApi.create(locals.supabase, 0);
        
        try {
            // Re-check capacity
            const robCourse = await api.getRobCourseByLink(link);
            const registrations = robCourse.persons?.length ?? 0;
            
            if (registrations >= robCourse.maxPersons) {
                return fail(400, { message: 'Der Kurs ist bereits ausgebucht' });
            }

            await api.addRobCoursePerson(robCourse.id, personName, dogName);
            return { success: true };
        } catch (e: any) {
            return fail(500, { message: e.message });
        }
    }
};
