<script lang="ts">
    import {page} from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonHistoryGrid from "$lib/components/persons/PersonHistoryGrid.svelte";
    import type {IMergedPersonHistory, IPerson} from "$lib/data/hfzApi";
    import thenby from 'thenby';
    import Card from "$lib/components/global/Card.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {Diff} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";

    const {firstBy} = thenby;

    let {data}: { data: any; } = $props();
    let type = $derived($page.url.searchParams.get("type") ?? "all");
    let history = $state([] as Array<IMergedPersonHistory>);
    let person = $state({} as IPerson);
    let filteredHistory = $derived.by(() => {
        return history.filter(h =>
            type === "all" ||
            type === "sale" && h.saleHistory?.length > 0 ||
            type === "course" && h.courseHistory?.length > 0 ||
            type === "credit" && h.creditHistory?.length > 0
        ).sort(firstBy(h => h.date, "desc"));
    });

    const loadHistory = async () => {
        history = await data.history;
        person = await data.person;
    }

    const filterItems = [
        {id: "all", label: "Alles"},
        {id: "sale", label: "Verkauf"},
        {id: "course", label: "Kurs"},
        {id: "credit", label: "Guthaben"},
    ];

</script>


{#await loadHistory()}
    <Loading></Loading>
{:then _}
    <Card className="max-w-xl m-auto">
        <PersonOverview person={person}></PersonOverview>
    </Card>

    <FilterBar className="p-0! mt-2" items={filterItems} parameterName="type" selected={type}></FilterBar>
    <div style="margin-left: -0.6em;margin-right: -0.6em;">
        <PersonHistoryGrid history={filteredHistory} {type}></PersonHistoryGrid>
    </div>

    <NavigationActions>
        <button slot="actions">
            <GlassCircleLink
                    className={" bg-primary/90! border-0 drop-shadow-primary/90 drop-shadow-xl "}
                    href={"/l/dialogs/person/" + person.id + "/actions"}>
                <Diff class="text-primary-foreground"/>
            </GlassCircleLink>
        </button>
    </NavigationActions>
{/await}
