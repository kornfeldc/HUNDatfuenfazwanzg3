import { fail } from '@sveltejs/kit';
import { HfzApi } from '$lib/data/hfzApi';
import { attendanceToday, isAttendanceDay } from '$lib/components/course/attendance';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const today = attendanceToday();
	const requestedDate = url.searchParams.get('date');
	const api = HfzApi.create(locals.supabase, locals.og!);
	return {
		today,
		selectedDate: isAttendanceDay(requestedDate, today) ? requestedDate : null,
		persons: await api.getPersonsWithCourseHistory(365, true)
	};
};

function mutationError(error: unknown) {
	console.error('Course attendance update failed', error);
	const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
	if (code === '40001') {
		return fail(409, {
			message: 'Diese Teilnahme wurde bereits geändert. Bitte die Seite neu laden.'
		});
	}
	if (code === '22023') {
		return fail(400, {
			message:
				'Die Auswahl ist nicht mehr gültig. Bitte die Seite neu laden und aktive Personen auswählen.'
		});
	}
	return fail(500, {
		message: 'Die Änderung konnte nicht gespeichert werden. Bitte erneut versuchen.'
	});
}

export const actions = {
	deduct: async ({ request, locals }) => {
		const form = await request.formData();
		const personId = Number(form.get('personId'));
		if (!Number.isSafeInteger(personId) || personId <= 0)
			return fail(400, { message: 'Ungültige Person.' });
		try {
			const api = HfzApi.create(locals.supabase, locals.og!);
			await api.addPersonCourse({ id: personId }, -1, new Date(`${attendanceToday()}T00:00:00Z`));
			return { success: true };
		} catch (error) {
			return mutationError(error);
		}
	},
	recordAttendance: async ({ request, locals }) => {
		const form = await request.formData();
		const date = form.get('date');
		const personIds = [...new Set(form.getAll('personId').map(Number))];
		if (
			!isAttendanceDay(date) ||
			personIds.length === 0 ||
			personIds.some((id) => !Number.isSafeInteger(id) || id <= 0)
		) {
			return fail(400, {
				message: 'Bitte ein gültiges Datum und mindestens eine Person auswählen.'
			});
		}
		try {
			const api = HfzApi.create(locals.supabase, locals.og!);
			const added = await api.recordCourseAttendance(personIds, date);
			return { success: true, added: added.length, skipped: personIds.length - added.length };
		} catch (error) {
			return mutationError(error);
		}
	},
	undoAttendance: async ({ request, locals }) => {
		const form = await request.formData();
		const date = form.get('date');
		const personId = Number(form.get('personId'));
		const historyId = Number(form.get('historyId'));
		const expectedCourses = Number(form.get('expectedCourses'));
		if (
			!isAttendanceDay(date) ||
			!Number.isSafeInteger(personId) ||
			personId <= 0 ||
			!Number.isSafeInteger(historyId) ||
			historyId <= 0 ||
			!Number.isSafeInteger(expectedCourses) ||
			expectedCourses >= 0
		) {
			return fail(400, { message: 'Ungültige Teilnahme.' });
		}
		try {
			const api = HfzApi.create(locals.supabase, locals.og!);
			await api.undoCourseAttendance(personId, historyId, date, expectedCourses);
			return { success: true };
		} catch (error) {
			return mutationError(error);
		}
	}
} satisfies Actions;
