<script lang="ts">
	import { Calendar } from 'bits-ui';
	import { parseDate } from '@internationalized/date';
	import { CalendarDays, ChevronLeft, ChevronRight, X } from '@lucide/svelte';

	let {
		day,
		today,
		filtered,
		onSelect
	}: {
		day: string;
		today: string;
		filtered: boolean;
		onSelect: (date: string) => void;
	} = $props();
	let open = $state(false);
	let trigger = $state<HTMLButtonElement>();
	const label = $derived(day.split('-').reverse().join('.'));

	function openModal(dialog: HTMLDialogElement) {
		dialog.showModal();
		return {
			destroy() {
				dialog.close();
				trigger?.focus({ preventScroll: true });
			}
		};
	}
</script>

<div class="min-w-0 flex-1 sm:max-w-56">
	<p class="text-xs font-medium text-muted-foreground">Datum filtern</p>
	<button
		bind:this={trigger}
		type="button"
		aria-label="Teilnahmedatum wählen"
		aria-haspopup="dialog"
		aria-expanded={open}
		onclick={() => (open = true)}
		class="mt-1 flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-base text-foreground"
	>
		<span>{filtered ? label : 'Datum wählen'}</span><CalendarDays size={18} class="shrink-0" />
	</button>
</div>

{#if open}
	<dialog
		use:openModal
		aria-labelledby="attendance-date-title"
		oncancel={(event) => {
			event.preventDefault();
			open = false;
		}}
		class="m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-sm overflow-y-auto rounded-2xl border border-border bg-background p-3 text-foreground shadow-xl backdrop:bg-black/50 sm:p-4"
	>
		<div class="mb-2 flex items-center justify-between gap-2">
			<h2 id="attendance-date-title" class="text-lg font-bold">Teilnahmedatum wählen</h2>
			<button
				type="button"
				aria-label="Kalender schließen"
				onclick={() => (open = false)}
				class="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-muted"
				><X size={20} /></button
			>
		</div>
		<Calendar.Root
			type="single"
			locale="de-AT"
			weekStartsOn={1}
			weekdayFormat="short"
			calendarLabel="Teilnahmedatum"
			value={parseDate(day)}
			maxValue={parseDate(today)}
			onValueChange={(value) => {
				open = false;
				onSelect(value?.toString() ?? day);
			}}
		>
			{#snippet children({ months, weekdays })}
				<Calendar.Header class="mb-2 flex items-center justify-between">
					<Calendar.PrevButton
						class="flex size-11 items-center justify-center rounded-lg hover:bg-muted"
					>
						{#snippet child({ props })}
							<button {...props} aria-label="Vorheriger Monat"><ChevronLeft size={20} /></button>
						{/snippet}
					</Calendar.PrevButton>
					<Calendar.Heading class="font-semibold" />
					<Calendar.NextButton
						class="flex size-11 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30"
					>
						{#snippet child({ props })}
							<button {...props} aria-label="Nächster Monat"><ChevronRight size={20} /></button>
						{/snippet}
					</Calendar.NextButton>
				</Calendar.Header>
				{#each months as month (month.value.toString())}
					<Calendar.Grid class="w-full table-fixed border-collapse">
						<Calendar.GridHead>
							<Calendar.GridRow>
								{#each weekdays as weekday (weekday)}
									<Calendar.HeadCell
										class="h-9 text-center text-xs font-medium text-muted-foreground"
										>{weekday}</Calendar.HeadCell
									>
								{/each}
							</Calendar.GridRow>
						</Calendar.GridHead>
						<Calendar.GridBody>
							{#each month.weeks as week (week[0].toString())}
								<Calendar.GridRow>
									{#each week as date (date.toString())}
										<Calendar.Cell {date} month={month.value} class="p-0.5">
											<Calendar.Day
												class="flex min-h-11 cursor-pointer items-center justify-center rounded-lg text-sm outline-offset-2 hover:bg-muted data-disabled:pointer-events-none data-disabled:opacity-30 data-outside-month:text-muted-foreground data-selected:bg-primary data-selected:font-bold data-selected:text-primary-foreground"
											/>
										</Calendar.Cell>
									{/each}
								</Calendar.GridRow>
							{/each}
						</Calendar.GridBody>
					</Calendar.Grid>
				{/each}
			{/snippet}
		</Calendar.Root>
	</dialog>
{/if}
