<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Plus, Undo2, CalendarDays } from '@lucide/svelte';
	import type { ICourseHistory, IPersonWithHistory } from '$lib/data/hfzApi';
	import {
		attendanceCount,
		attendanceEntries,
		matchesAttendanceSearch,
		shiftAttendanceDay
	} from './attendance';
	import AttendancePicker from './AttendancePicker.svelte';
	import AttendanceDatePicker from './AttendanceDatePicker.svelte';

	let {
		persons,
		day,
		today,
		filtered,
		search = ''
	}: {
		persons: IPersonWithHistory[];
		day: string;
		today: string;
		filtered: boolean;
		search?: string;
	} = $props();
	let pickerOpen = $state(false);
	let message = $state('');
	let undo = $state<{ person: IPersonWithHistory; entry: ICourseHistory } | null>(null);
	let undoing = $state(false);
	let undoError = $state('');
	const label = $derived(day.split('-').reverse().join('.'));
	const yesterday = $derived(shiftAttendanceDay(today, -1));
	const allAttendees = $derived(persons.filter((person) => attendanceCount(person, day) > 0));
	const attendees = $derived(
		allAttendees
			.filter((person) => matchesAttendanceSearch(person, search))
			.sort((a, b) =>
				`${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'de')
			)
	);

	function openUndo(person: IPersonWithHistory) {
		const entry = attendanceEntries(person, day).sort((a, b) => b.id - a.id)[0];
		undoError = '';
		undo = { person, entry };
	}
	function openModal(dialog: HTMLDialogElement) {
		dialog.showModal();
	}
</script>

<section
	class="space-y-4 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-5"
	aria-labelledby="attendance-title"
>
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<h2 id="attendance-title" class="flex items-center gap-2 text-lg font-bold">
				<CalendarDays size={20} />Teilnahmen · {day === today ? 'Heute' : label}
			</h2>
			<p class="mt-1 text-sm text-muted-foreground">{allAttendees.length} Personen · {label}</p>
		</div>
		{#if filtered}<a
				href="?"
				class="flex min-h-11 items-center text-sm font-medium text-primary underline"
				>Zur Übersicht</a
			>{/if}
	</div>
	<div class="flex flex-wrap items-end gap-2">
		<a
			href={`?date=${today}`}
			aria-current={day === today ? 'date' : undefined}
			class="flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium {day ===
			today
				? 'bg-primary text-primary-foreground'
				: 'bg-background'}">Heute</a
		>
		<a
			href={`?date=${yesterday}`}
			aria-current={day === yesterday ? 'date' : undefined}
			class="flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium {day ===
			yesterday
				? 'bg-primary text-primary-foreground'
				: 'bg-background'}">Gestern</a
		>
		<AttendanceDatePicker
			{day}
			{today}
			{filtered}
			onSelect={(date) => {
				message = '';
				goto(`?date=${date}`);
			}}
		/>
	</div>
	<button
		type="button"
		onclick={() => {
			message = '';
			pickerOpen = true;
		}}
		class="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground sm:w-auto"
	>
		<Plus size={20} />Teilnehmende hinzufügen
	</button>
	{#if message}<p role="status" class="rounded-lg bg-primary/10 p-3 text-sm">{message}</p>{/if}
	<div class="divide-y divide-border">
		{#each attendees as person (person.id)}
			<div class="flex items-center justify-between gap-2 py-3">
				<a
					href={`/l/dialogs/person/${person.id}/history?type=course`}
					class="min-w-0 flex-1 rounded py-1"
				>
					<div class="font-semibold break-words">{person.lastName} {person.firstName}</div>
					{#if person.dogNames}<p class="text-sm break-words text-muted-foreground">
							{person.dogNames}
						</p>{/if}
					<p class="text-sm text-primary">
						{attendanceCount(person, day)}
						{attendanceCount(person, day) === 1 ? 'Einheit abgezogen' : 'Einheiten abgezogen'}
					</p>
				</a>
				<button
					type="button"
					onclick={() => openUndo(person)}
					aria-label={`Eine Teilnahme von ${person.lastName} ${person.firstName} rückgängig machen`}
					class="flex min-h-11 shrink-0 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
				>
					<Undo2 size={16} /><span>Rückgängig</span>
				</button>
			</div>
		{:else}
			<p class="py-6 text-center text-sm text-muted-foreground">
				{allAttendees.length
					? 'Keine Teilnehmenden entsprechen der Suche.'
					: 'Für diesen Tag sind noch keine Teilnahmen erfasst.'}
			</p>
		{/each}
	</div>
</section>

{#if pickerOpen}
	<AttendancePicker
		{persons}
		{day}
		{today}
		onClose={() => (pickerOpen = false)}
		onSaved={(text) => {
			message = text;
			pickerOpen = false;
		}}
	/>
{/if}

{#if undo}
	<dialog
		use:openModal
		aria-labelledby="undo-attendance-title"
		class="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-background p-5 text-foreground shadow-xl backdrop:bg-black/50"
		oncancel={(event) => {
			event.preventDefault();
			if (!undoing) undo = null;
		}}
	>
		<form
			method="POST"
			action="?/undoAttendance"
			class="space-y-4"
			use:enhance={() => {
				undoing = true;
				undoError = '';
				return async ({ result, update }) => {
					try {
						if (result.type === 'success') {
							await update();
							message = `Eine Teilnahme für ${label} rückgängig gemacht. 1 Einheit wieder gutgeschrieben.`;
							undo = null;
						} else {
							undoError =
								result.type === 'failure' && typeof result.data?.message === 'string'
									? result.data.message
									: 'Die Teilnahme konnte nicht rückgängig gemacht werden.';
						}
					} catch {
						undoError = 'Die Ansicht konnte nicht aktualisiert werden. Bitte die Seite neu laden.';
					} finally {
						undoing = false;
					}
				};
			}}
		>
			<h2 id="undo-attendance-title" class="text-xl font-bold">Teilnahme rückgängig machen?</h2>
			<p><strong>{undo.person.lastName} {undo.person.firstName}</strong> · {label}</p>
			<p class="text-sm text-muted-foreground">
				Eine Teilnahme wird entfernt und 1 Einheit wieder gutgeschrieben. Die Änderung wird
				protokolliert.
			</p>
			<input type="hidden" name="date" value={day} />
			<input type="hidden" name="personId" value={undo.person.id} />
			<input type="hidden" name="historyId" value={undo.entry.id} />
			<input type="hidden" name="expectedCourses" value={undo.entry.courses} />
			{#if undoError}<p role="alert" class="text-sm text-destructive">{undoError}</p>{/if}
			<div class="flex flex-col gap-2 sm:flex-row">
				<button
					type="button"
					disabled={undoing}
					onclick={() => (undo = null)}
					class="min-h-12 flex-1 rounded-lg border border-border px-4 font-medium disabled:opacity-50"
					>Abbrechen</button
				>
				<button
					type="submit"
					disabled={undoing}
					class="min-h-12 flex-1 rounded-lg bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50"
				>
					{undoing ? 'Wird gespeichert …' : '1 Einheit gutschreiben'}
				</button>
			</div>
		</form>
	</dialog>
{/if}
