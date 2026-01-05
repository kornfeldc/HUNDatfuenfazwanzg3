import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";
import pkg from '../../../../../package.json';

export async function load({cookies, params, url, locals}) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    const hfzUser = await api.getUser();
    
    let unassignedUsers: any[] = [];
    if (hfzUser.admin) {
        unassignedUsers = await api.getUnassignedUsers();
    }
    
    return {
        hfzUser,
        unassignedUsers,
        version: pkg.version
    };
}

export const actions = {
    updateTheme: async ({request, locals}) => {
        const formData = await request.formData();
        const theme = formData.get('theme')?.toString();
        const redirectTo = formData.get('redirectTo')?.toString() ?? "/l/dialogs/user";
        
        console.log("formData theme", theme);

        if (!theme) {
            return fail(400, { error: 'Theme is required' });
        }

        const { data: { user } } = await locals.supabase.auth.getUser();
        if (!user || !user.email) {
            return fail(401, { error: 'Unauthorized' });
        }

        const api = HfzApi.create(locals.supabase, locals.og!);
        try {
            await api.updateUserTheme(user.email, theme);
        } catch (e: any) {
            return fail(500, { error: e.message });
        }

        throw redirect(303, redirectTo);
    },
    
    assignOg: async ({request, locals}) => {
        const formData = await request.formData();
        const email = formData.get('email')?.toString();

        if (!email) {
            return fail(400, { error: 'Email is required' });
        }

        const api = HfzApi.create(locals.supabase, locals.og!);
        const currentUser = await api.getUser();

        if (!currentUser.admin) {
            return fail(403, { error: 'Forbidden' });
        }

        if (!locals.og) {
            return fail(400, { error: 'Admin has no OG' });
        }

        try {
            await api.assignUserToOg(email, locals.og);
        } catch (e: any) {
            return fail(500, { error: e.message });
        }

        return { success: true };
    }
};
