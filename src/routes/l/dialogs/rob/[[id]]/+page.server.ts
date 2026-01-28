import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({cookies, params, url, locals}) {
    const {id} = params;
    if (!id) return {title: 'Neuer Rob Kurs'};
    const api = HfzApi.create(locals.supabase, locals.og!);
    return {
        robCourse: api.getRobCourse({id: parseInt(id)})
    };
}

export const actions = {
    default: async ({cookies, request, params, locals}) => {
        const {id} = params;
        const formData = await request.formData();

        const redirectTo = formData.get('redirectTo')?.toString() ?? "/l/modules/rob";
        formData.delete('redirectTo');

        let data = Util.parseFormData(formData, [
            {
                properties: ["maxPersons"],
                method: (value: any) => parseInt(value)
            },
            {
                properties: ["date"],
                method: (value: any) => new Date(value)
            }
        ]);
        if(id)
            data.id = parseInt(id);
        
        console.log("parsed rob data", data);

        try {
            const api = HfzApi.create(locals.supabase, locals.og!);
            if (id) await api.updateRobCourse(data as any);
            else await api.createRobCourse(data as any);
        } catch (e: any) {
            return fail(422, {
                error: e.message
            });
        }

        throw redirect(303, redirectTo);
    },
    delete: async ({params, locals}) => {
        const {id} = params;
        if (!id) return fail(400, {error: "No ID provided"});

        try {
            const api = HfzApi.create(locals.supabase, locals.og!);
            await api.deleteRobCourse({id: parseInt(id)});
        } catch (e: any) {
            return fail(422, {error: e.message});
        }

        throw redirect(303, "/l/modules/rob");
    }
};
