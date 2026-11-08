<script lang="ts">
	import Loading from '$lib/components/global/Loading.svelte';
	import { type IPersonWithHistory } from '$lib/data/hfzApi';
	import { uiState } from '$lib/stores/uiState.svelte';

	import thenby from 'thenby';
	import CourseGrid from '$lib/components/course/CourseGrid.svelte';
	import { Util, moment } from '$lib/util';
	import { page } from '$app/stores';
	import AttendanceDay from '$lib/components/course/AttendanceDay.svelte';
	import { attendanceCount } from '$lib/components/course/attendance';
	import FilterBar from '$lib/components/global/FilterBar.svelte';

	const { firstBy } = thenby;

	let {
		data,
		form
	}: {
		data: {
			persons: Array<IPersonWithHistory>;
			today: string;
			selectedDate: string | null;
		};
		form?: { message?: string } | null;
	} = $props();
	let submitting = $state(false);

	let type = $derived($page.url.searchParams.get('type') ?? 'all');

	const sortPersons = (persons: Array<IPersonWithHistory>) => {
		return persons.sort(
			firstBy(
				(person: IPersonWithHistory) =>
					((person.lastName || '') + ' ' + (person.firstName || '')).trim().toLowerCase() ||
					'\uffff'
			)
		);
	};

	const filterAndGroup = (persons: Array<IPersonWithHistory>) => {
		const filtered = persons.filter(
			(p: IPersonWithHistory) =>
				p.lastName?.toLowerCase().includes(uiState.searchString.toLowerCase()) ||
				p.firstName?.toLowerCase().includes(uiState.searchString.toLowerCase()) ||
				p.dogNames?.toLowerCase().includes(uiState.searchString.toLowerCase())
		);

		const activityThreshold = moment().subtract(365, 'days').startOf('day');

		const tookCourseToday: Array<IPersonWithHistory> = [];
		const active365: Array<IPersonWithHistory> = [];
		const inactive: Array<IPersonWithHistory> = [];

		for (const p of filtered) {
			// "took a course today" means they got removed at least one course today
			const hasActivityToday = attendanceCount(p, data.today) > 0;
			const lastEntry = p.courseHistory
				?.filter((h) => moment(h.date).isSameOrAfter(activityThreshold, 'day'))
				.sort((a, b) => moment(b.date).diff(moment(a.date)))[0];
			const hasActivity365 =
				p.courseCount > 0
					? !!lastEntry
					: p.courseHistory?.some(
							(h) => moment(h.date).isSameOrAfter(activityThreshold, 'day') && h.courses > 0
						);

			if (hasActivityToday) {
				tookCourseToday.push(p);
			} else if (hasActivity365) {
				active365.push(p);
			} else if (p.courseCount > 0) {
				inactive.push(p);
			}
		}

		return {
			tookCourseToday: sortPersons(tookCourseToday),
			active365: sortPersons(active365),
			inactive: sortPersons(inactive)
		};
	};

	const filterItems = [
		{ id: 'all', label: 'Alle' },
		{ id: 'active', label: 'Aktive Kursler' },
		{ id: 'today', label: 'Heute abgezogen' },
		{ id: 'inactive', label: 'Inaktive Kursler' }
	];
</script>

{#await data.persons}
	<div class="p-8">
		<Loading></Loading>
	</div>
{:then persons}
	{@const grouped = filterAndGroup(persons)}
	{@const allActive = [...grouped.active365, ...grouped.tookCourseToday, ...grouped.inactive]}
	{@const totalCount = allActive.length}
	{@const totalCourses = allActive.reduce((acc, p) => acc + (p.courseCount || 0), 0)}

	<div class="flex flex-col gap-4 p-2 pb-20 sm:p-4">
		{#if form?.message}<p
				role="alert"
				class="rounded-lg border border-destructive p-3 text-destructive"
			>
				{form.message}
			</p>{/if}
		<!-- Global Header -->
		<div class="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-5">
			<h1 class="text-2xl font-bold tracking-tight text-foreground">Kursverwaltung</h1>
			<p class="text-sm font-medium text-muted-foreground">
				{totalCount} Personen mit insgesamt {Util.formatCurrency(totalCourses, false, 0)} offenen Einheiten
			</p>
		</div>

		{#key data.selectedDate ?? data.today}
			<AttendanceDay
				{persons}
				day={data.selectedDate ?? data.today}
				today={data.today}
				filtered={data.selectedDate !== null}
				search={uiState.searchString}
			/>
		{/key}

		{#if data.selectedDate === null}
			<FilterBar className="px-1" items={filterItems} selected={type} parameterName="type"
			></FilterBar>

			{#if (type === 'all' || type === 'active') && grouped.active365.length > 0}
				<section>
					<div class="mb-3 px-1">
						<h2 class="text-lg font-bold text-foreground">Aktive Kursler (letztes Jahr)</h2>
						<p class="text-xs font-medium text-muted-foreground">
							{grouped.active365.length} Personen &middot; {Util.formatCurrency(
								grouped.active365.reduce((acc, p) => acc + (p.courseCount || 0), 0),
								false,
								0
							)} Einheiten
						</p>
					</div>
					<CourseGrid
						persons={grouped.active365}
						group="active"
						onSubmitting={(val) => (submitting = val)}
					/>
				</section>
			{/if}

			{#if (type === 'all' || type === 'inactive') && grouped.inactive.length > 0}
				<section>
					<div class="mb-3 px-1">
						<h2 class="text-lg font-bold text-foreground">Inaktive Kursler</h2>
						<p class="text-xs font-medium text-muted-foreground">
							{grouped.inactive.length} Personen &middot; {Util.formatCurrency(
								grouped.inactive.reduce((acc, p) => acc + (p.courseCount || 0), 0),
								false,
								0
							)} Einheiten
						</p>
					</div>
					<CourseGrid
						persons={grouped.inactive}
						group="inactive"
						onSubmitting={(val) => (submitting = val)}
					/>
				</section>
			{/if}

			{#if totalCount === 0 && uiState.searchString}
				<div class="p-12 text-center text-muted-foreground">
					Keine Personen gefunden, die der Suche entsprechen.
				</div>
			{/if}
		{/if}
	</div>
{:catch}
	<p role="alert" class="p-8 text-destructive">
		Die Kursdaten konnten nicht geladen werden. Bitte die Seite neu laden.
	</p>
{/await}

{#if submitting}
	<Loading />
{/if}
