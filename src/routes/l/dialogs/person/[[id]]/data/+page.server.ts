import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({cookies, params, url, locals}) {
    const {id} = params;
    if (!id) return {title: 'Neue Person'};
    const api = HfzApi.create(locals.supabase, locals.og!);
    try {
        return {
            person: await api.getPerson({id: parseInt(id)})
        };
    } catch (e) {
        throw redirect(303, "/l/modules/persons");
    }
}

export const actions = {
    default: async ({cookies, request, params, locals}) => {
        const {id} = params; // Extract the `id` parameter from the `params` object
        const formData = await request.formData();
        const api = HfzApi.create(locals.supabase, locals.og!);

        if (formData.get('deleteAction')) {
            try {
                if (id) await api.deletePerson({id: parseInt(id)});
            } catch (e: any) {
                console.error("Delete person error", e);
                return fail(422, {
                    error: "Person konnte nicht gelöscht werden. Evtl. sind noch Verkäufe oder Kursbuchungen verknüpft."
                });
            }
            throw redirect(303, "/l/modules/persons");
        }

        const redirectTo = formData.get('redirectTo')?.toString() ?? "/l/modules/persons";
        formData.delete('redirectTo');

        let data = Util.parseFormData(formData, [
                {
                    properties: ["isMember", "isActive", "isConnected"],
                    method: (value: any) => value === 'true' || value === 'on'
                }
            ]);
        if(id)
            data.id = parseInt(id);
        
        if(!data.isConnected && data.personGroup)
            data.personGroup = "";
        data.personGroup = data.personGroup ?? "";
        
        delete data.isConnected;
        console.log("parsed data", data);

        let savedPerson: IPerson;
        try {
            if (id) savedPerson = await api.updatePerson(data as any);
            else savedPerson = await api.createPerson(data as any);
        } catch (e: any) {
            console.log("error", e);
            return fail(422, {
                error: e.message
            });
        }

        let finalRedirectTo = redirectTo;
        if (finalRedirectTo.includes("{id}")) {
            finalRedirectTo = finalRedirectTo.replace("{id}", savedPerson!.id.toString());
        }

        throw redirect(303, finalRedirectTo);

        // const redirectTo = formData.get('redirectTo')!.toString();
        // formData.delete('redirectTo');
        //
        // if (!formData.get('companyId')) formData.delete('companyId');
        //
        // try {
        //     const ngData = new NgData(cookies);
        //     if (id) await ngData.updatePerson(id, formData);
        //     else await ngData.createPerson(formData);
        // } catch (e: any) {
        //     return fail(422, {
        //         error: e.message
        //     });
        // }
        // throw redirect(303, redirectTo);
    }
};
