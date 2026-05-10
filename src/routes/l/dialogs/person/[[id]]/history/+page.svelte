<script lang="ts">
    import {page} from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonHistoryGrid from "$lib/components/persons/PersonHistoryGrid.svelte";
    import type {IMergedPersonHistory, IPerson} from "$lib/data/hfzApi";
    import thenby from 'thenby';
    import Card from "$lib/components/global/Card.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import {Diff} from "@lucide/svelte";
    import History from "$lib/components/global/History.svelte";
    import { breadcrumbStore } from '$lib/stores/breadcrumbStore.svelte';

    const {firstBy} = thenby;

    let {data}: { data: any; } = $props();
    let type = $derived($page.url.searchParams.get("type") ?? "all");
    let history = $state([] as Array<IMergedPersonHistory>);
    let fullHistory = $state([] as Array<IHistory>);
    let person = $state({} as IPerson);
    let filteredHistory = $derived.by(() => {
        if (type === "actions") return []; 
        return history.filter(h =>
            type === "all" ||
            type === "sale" && h.saleHistory?.length > 0 ||
            type === "course" && h.courseHistory?.length > 0 ||
            type === "credit" && h.creditHistory?.length > 0
        ).sort(firstBy(h => h.date, "desc"));
    });

    const loadHistory = async () => {
        history = await data.history;
        fullHistory = await data.fullHistory;
        person = await data.person;
        breadcrumbStore.detailLabel = person
            ? (person.firstName + ' ' + person.lastName).trim()
            : '';
    }

    const filterItems = [
        {id: "all", label: "Alles"},
        {id: "sale", label: "Verkauf"},
        {id: "course", label: "Kurs"},
        {id: "credit", label: "Guthaben"},
        {id: "actions", label: "Aktionen"},
    ];

</script>


{#await loadHistory()}
    <Loading></Loading>
{:then _}
    <Card className="max-w-xl m-auto">
        <PersonOverview person={person}></PersonOverview>
    </Card>

    <FilterBar className="p-0! mt-2 mb-2" items={filterItems} parameterName="type" selected={type}></FilterBar>
    <div style="margin-left: -0.6em;margin-right: -0.6em;">
        {#if type === "actions"}
            <div class="px-2">
                <History history={fullHistory}></History>
            </div>
        {:else}
            <PersonHistoryGrid history={filteredHistory} {type}></PersonHistoryGrid>
        {/if}
    </div>

    <PlaceAtBottom>
        <a href={"/l/dialogs/person/" + person.id + "/actions"} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-primary hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <Diff class="w-6 h-6"/>
        </a>
    </PlaceAtBottom>
{/await}
