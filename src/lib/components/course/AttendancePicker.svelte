<script lang="ts">
	import { enhance } from '$app/forms';
	import type { IPersonWithHistory } from '$lib/data/hfzApi';
	import { attendanceCount, matchesAttendanceSearch, rankAttendancePersons } from './attendance';
	import { Search, X, Check } from '@lucide/svelte';

	let {
		persons,
		day,
		today,
		onClose,
		onSaved
	}: {
		persons: IPersonWithHistory[];
		day: string;
		today: string;
		onClose: () => void;
		onSaved: (message: string) => void;
	} = $props();
	let search = $state('');
	let selected = $state<number[]>([]);
	let saving = $state(false);
	let error = $state('');
	const label = $derived(day.split('-').reverse().join('.'));
	const ranked = $derived(
		rankAttendancePersons(
			persons.filter((person) => person.isActive),
			today
		)
	);
	const filtered = $derived(ranked.filter((person) => matchesAttendanceSearch(person, search)));

	function openModal(dialog: HTMLDialogElement) {
		dialog.showModal();
	}
	function toggle(id: number) {
		selected = selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id];
	}
</script>

<dialog
	use:openModal
	aria-labelledby="attendance-picker-title"
	class="fixed inset-0 m-0 h-dvh max-h-dvh w-screen max-w-none bg-background p-0 text-foreground backdrop:bg-black/50 sm:m-auto sm:h-[min(90dvh,48rem)] sm:max-w-xl sm:rounded-2xl sm:border sm:border-border"
	oncancel={(event) => {
		event.preventDefault();
		if (!saving) onClose();
	}}
>
	<form
		method="POST"
		action="?/recordAttendance"
		class="flex h-full min-h-0 flex-col"
		use:enhance={() => {
			saving = true;
			error = '';
			return async ({ result, update }) => {
				try {
					if (result.type === 'success') {
						await update();
						const added = Number(result.data?.added ?? 0);
						const skipped = Number(result.data?.skipped ?? 0);
						onSaved(
							`${added} Teilnahme(n) für ${label} gespeichert.${skipped ? ` ${skipped} bereits erfasst.` : ''}`
						);
					} else {
						error =
							result.type === 'failure' && typeof result.data?.message === 'string'
								? result.data.message
								: 'Speichern fehlgeschlagen. Bitte erneut versuchen.';
					}
				} catch {
					error = 'Die Ansicht konnte nicht aktualisiert werden. Bitte erneut versuchen.';
				} finally {
					saving = false;
				}
			};
		}}
	>
		<input type="hidden" name="date" value={day} />
		{#each selected as id (id)}<input type="hidden" name="personId" value={id} />{/each}
		<header
			class="shrink-0 space-y-3 border-b border-border p-4 pt-[max(1rem,env(safe-area-inset-top))]"
		>
			<div class="flex items-start justify-between gap-2">
				<div>
					<h2 id="attendance-picker-title" class="text-xl font-bold">Teilnehmende hinzufügen</h2>
					<p class="text-sm text-muted-foreground">{label} · Regelmäßige Teilnehmende zuerst</p>
				</div>
				<button
					type="button"
					aria-label="Abbrechen"
					disabled={saving}
					onclick={onClose}
					class="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-50"
					><X size={22} /></button
				>
			</div>
			<label class="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
				<Search size={18} class="shrink-0 text-muted-foreground" />
				<span class="sr-only">Person oder Hund suchen</span>
				<input
					type="search"
					bind:value={search}
					placeholder="Person oder Hund suchen"
					class="min-h-12 w-full min-w-0 border-0 bg-transparent text-base outline-none"
				/>
			</label>
		</header>
		<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2" aria-busy={saving}>
			{#each filtered as person (person.id)}
				{@const recorded = attendanceCount(person, day) > 0}
				<label
					class="flex min-h-20 items-center gap-3 border-b border-border px-2 py-3 {recorded
						? 'opacity-60'
						: 'cursor-pointer'} {selected.includes(person.id) ? 'bg-primary/10' : ''}"
				>
					<input
						type="checkbox"
						checked={selected.includes(person.id) || recorded}
						disabled={saving || recorded}
						onchange={() => toggle(person.id)}
						aria-label={`${person.lastName} ${person.firstName}${recorded ? ' · Bereits erfasst' : ''}`}
						class="size-5 shrink-0 accent-primary"
					/>
					<div class="min-w-0 flex-1">
						<div class="font-semibold break-words">{person.lastName} {person.firstName}</div>
						{#if person.dogNames}<div class="text-sm break-words text-muted-foreground">
								{person.dogNames}
							</div>{/if}
						{#if recorded}
							<span class="flex items-center gap-1 text-sm text-primary"
								><Check size={14} />Bereits erfasst</span
							>
						{:else}
							<span
								class="text-sm {person.courseCount <= 0
									? 'font-medium text-destructive'
									: 'text-muted-foreground'}"
							>
								{person.courseCount} Einheiten frei{person.courseCount <= 0
									? ' · Kein Guthaben'
									: ''}
							</span>
						{/if}
					</div>
				</label>
			{:else}
				<p class="p-8 text-center text-muted-foreground">Keine aktiven Personen gefunden.</p>
			{/each}
		</div>
		<footer
			class="shrink-0 space-y-2 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
		>
			{#if error}<p role="alert" class="text-sm text-destructive">{error}</p>{/if}
			<p class="text-sm text-muted-foreground" aria-live="polite">
				{selected.length} ausgewählt · Je Person wird 1 Einheit abgezogen.
			</p>
			<button
				type="submit"
				disabled={saving || selected.length === 0}
				class="min-h-12 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50"
			>
				{saving ? 'Wird gespeichert …' : `Teilnahmen erfassen (${selected.length}) · ${label}`}
			</button>
		</footer>
	</form>
</dialog>
