<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import SearchButton from "$lib/components/global/NavigationButtons/SearchButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {type IPersonWithHistory} from "$lib/data/hfzApi";

    import thenby from 'thenby';
    import CourseGrid from "$lib/components/course/CourseGrid.svelte";
    import {Util, moment} from "$lib/util";
    import { page } from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";

    const {firstBy} = thenby;

    let {data}: { data: { persons: Promise<Array<IPersonWithHistory>> } } = $props();
    let searchString = $state("");
    let submitting = $state(false);

    let type = $derived($page.url.searchParams.get("type") ?? "all");

    const onSearch = (value: string) => {
        searchString = value;
    }

    const sortPersons = (persons: Array<IPersonWithHistory>) => {
        return persons.sort(
            firstBy((person: IPersonWithHistory) => person.lastName || '\uffff', {ignoreCase: true})
                .thenBy((person: IPersonWithHistory) => person.firstName || '\uffff', {ignoreCase: true})
        );
    }

    const filterAndGroup = (persons: Array<IPersonWithHistory>) => {
        const filtered = persons.filter((p: IPersonWithHistory) =>
            (p.lastName?.toLowerCase().includes(searchString.toLowerCase()) ||
                p.firstName?.toLowerCase().includes(searchString.toLowerCase()) ||
                p.dogNames?.toLowerCase().includes(searchString.toLowerCase()))
        );

        const today = moment().startOf('day');
        const activityThreshold = moment().subtract(365, 'days').startOf('day');

        const tookCourseToday: Array<IPersonWithHistory> = [];
        const active365: Array<IPersonWithHistory> = [];
        const inactive: Array<IPersonWithHistory> = [];

        for (const p of filtered) {
            // "took a course today" means they got removed at least one course today
            const hasActivityToday = p.courseHistory?.some(h => moment(h.date).isSame(today, 'day') && h.courses < 0);
            const hasActivity365 = p.courseHistory?.some(h => moment(h.date).isSameOrAfter(activityThreshold, 'day') && h.courses > 0);

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
    }

    const filterItems = [
        {id: "all", label: "Alle"},
        {id: "active", label: "Aktive Kursler"},
        {id: "today", label: "Heute abgezogen"},
        {id: "inactive", label: "Inaktive Kursler"},
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

    <div class="flex flex-col gap-4 p-2 sm:p-4 pb-20">
        <!-- Global Header -->
        <div class="bg-card border border-border p-3 sm:p-5 rounded-xl shadow-sm flex flex-col gap-1">
            <h1 class="text-2xl font-bold tracking-tight text-foreground">Kursverwaltung</h1>
            <p class="text-sm text-muted-foreground font-medium">
                {totalCount} Personen mit insgesamt {Util.formatCurrency(totalCourses, false, 0)} offenen Einheiten
            </p>
        </div>

        <FilterBar className="px-1" items={filterItems} selected={type} parameterName="type"></FilterBar>

        {#if (type === "all" || type === "active") && grouped.active365.length > 0}
            <section>
                <div class="mb-3 px-1">
                    <h2 class="text-lg font-bold text-foreground">Aktive Kursler (letztes Jahr)</h2>
                    <p class="text-xs text-muted-foreground font-medium">
                        {grouped.active365.length} Personen &middot; {Util.formatCurrency(grouped.active365.reduce((acc, p) => acc + (p.courseCount || 0), 0), false, 0)} Einheiten
                    </p>
                </div>
                <CourseGrid persons={grouped.active365} group="active" onSubmitting={(val) => submitting = val}/>
            </section>
        {/if}

        {#if (type === "all" || type === "today") && grouped.tookCourseToday.length > 0}
            <section>
                <div class="mb-3 px-1">
                    <h2 class="text-lg font-bold text-foreground">Heute abgezogen</h2>
                    <p class="text-xs text-muted-foreground font-medium">
                        {grouped.tookCourseToday.length} Personen &middot; {Util.formatCurrency(grouped.tookCourseToday.reduce((acc, p) => acc + (p.courseCount || 0), 0), false, 0)} Einheiten
                    </p>
                </div>
                <CourseGrid persons={grouped.tookCourseToday} group="today" onSubmitting={(val) => submitting = val}/>
            </section>
        {/if}

        {#if (type === "all" || type === "inactive") && grouped.inactive.length > 0}
            <section>
                <div class="mb-3 px-1">
                    <h2 class="text-lg font-bold text-foreground">Inaktive Kursler</h2>
                    <p class="text-xs text-muted-foreground font-medium">
                        {grouped.inactive.length} Personen &middot; {Util.formatCurrency(grouped.inactive.reduce((acc, p) => acc + (p.courseCount || 0), 0), false, 0)} Einheiten
                    </p>
                </div>
                <CourseGrid persons={grouped.inactive} group="inactive" onSubmitting={(val) => submitting = val}/>
            </section>
        {/if}

        {#if totalCount === 0 && searchString}
             <div class="p-12 text-center text-muted-foreground">
                 Keine Personen gefunden, die der Suche entsprechen.
             </div>
        {/if}
    </div>
{/await}

{#if submitting}
    <Loading />
{/if}

<NavigationActions>
    <SearchButton {onSearch} slot="persistent"></SearchButton>
</NavigationActions>
