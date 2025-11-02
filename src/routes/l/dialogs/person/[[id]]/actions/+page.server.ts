import type { Actions } from './$types';
import {fail, json, redirect} from '@sveltejs/kit';
import { HfzApi } from '$lib/data/hfzApi';

export async function load({cookies, params, url}) {
    const {id} = params;
    if(!id) return fail(404, "No id");

    const api = HfzApi.create();
    return {
        person: api.getPerson({id: parseInt(id)})
    };
}
export const actions: Actions = {
    modifyCourses: async ({ url, request, params }) => {
        try {
            const form = await request.formData();
            const countRaw = form.get('count');
            const dateRaw = form.get('date');
            const idParam = params.id;

            if (idParam == null) {
                return fail(400, { message: 'Missing person id' });
            }
            const count = Number(countRaw);
            if (!Number.isFinite(count) || Number.isNaN(count)) {
                return fail(400, { message: 'Invalid count' });
            }
            const dateStr = String(dateRaw ?? '');
            if (!dateStr) {
                return fail(400, { message: 'Missing date' });
            }
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) {
                return fail(400, { message: 'Invalid date' });
            }

            const api = HfzApi.create();
            await api.addPersonCourse({ id: Number(idParam) }, count, date);
        } catch (e: any) {
            console.error('modifyCourses error', e);
        }
    },
    modifyCredit: async ({ url, request, params }) => {
        try {
            const form = await request.formData();
            const amountRaw = form.get('amount');
            const dateRaw = form.get('date');
            const idParam = params.id;

            if (idParam == null) {
                return fail(400, { message: 'Missing person id' });
            }
            const amount = Number(amountRaw);
            if (!Number.isFinite(amount) || Number.isNaN(amount)) {
                return fail(400, { message: 'Invalid amount' });
            }
            const dateStr = String(dateRaw ?? '');
            if (!dateStr) {
                return fail(400, { message: 'Missing date' });
            }
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) {
                return fail(400, { message: 'Invalid date' });
            }

            const api = HfzApi.create();
            await api.addPersonCredit({ id: Number(idParam) }, amount, date);
        } catch (e: any) {
            console.error('modifyCredit error', e);
        }
    }
};
