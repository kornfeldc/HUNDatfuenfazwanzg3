import {HfzApi} from "$lib/data/hfzApi";
import {fail, redirect} from "@sveltejs/kit";
import {Util} from "$lib/util";

export async function load({cookies, params, url, locals}) {
    const {id} = params;
    if (!id) return {title: 'Neuer Artikel'};
    const api = HfzApi.create(locals.supabase, locals.og!);
    return {
        sale: api.getSale({id: parseInt(id)}),
    };
}

export const actions = {
    default: async ({cookies, request, params, locals}) => {
        const {id} = params;
        const api = HfzApi.create(locals.supabase, locals.og!);
        const formData = await request.formData();

        const redirectTo = formData.get('redirectTo')?.toString() ?? "/l/modules/sales";

        let data = Util.parseFormData(formData, [
            {properties: ['given', 'inclTip', 'addAdditionalCredit', 'toPay'], method: (val) => parseFloat(val)},
            {properties: ['usedCredit'], method: (val) => val === 'true'}
        ]);

        if(id)
            data.id = parseInt(id);

        console.log("parsed payment data", data);

        try {
            const saleToUpdate = {
                id: data.id,
                given: data.given,
                inclTip: data.inclTip,
                addAdditionalCredit: data.addAdditionalCredit,
                usedCredit: data.usedCredit,
                toPay: data.toPay,
                payDate: new Date()
            } as any;

            await api.saveSale(saleToUpdate);
        } catch (e: any) {
            console.error("Error saving sale payment:", e);
            return fail(422, {
                error: e.message
            });
        }

        throw redirect(303, redirectTo);
    }
};
