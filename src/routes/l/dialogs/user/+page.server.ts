import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({cookies, params, url, locals}) {
    const api = HfzApi.create(locals.supabase, locals.og!);
    return {
        hfzUser: await api.getUser()
    };
}

export const actions = {
    default: async ({request, locals}) => {
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
    }
};
