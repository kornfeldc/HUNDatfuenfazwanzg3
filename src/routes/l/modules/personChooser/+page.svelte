<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonsGrid from "$lib/components/persons/PersonsGrid.svelte";
    import {type IPerson} from "$lib/data/hfzApi";
    import {Euro} from "@lucide/svelte";

    import thenby from 'thenby';
    import {page} from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import {onDestroy, onMount} from "svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import SearchBar from "$lib/components/global/SearchBar.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import Card from "$lib/components/global/Card.svelte";

    const {firstBy} = thenby;

    let {data}: { data: any } = $props();
    let searchString = $state("");

    let type = $derived($page.url.searchParams.get("type") ?? "active");

    const onSearch = (value: string) => {
        searchString = value;
    }

    const filter = (persons: Array<IPerson>) => {
        return persons.filter((p: IPerson) =>
            (p.lastName?.toLowerCase().includes(searchString.toLowerCase()) ||
                p.firstName?.toLowerCase().includes(searchString.toLowerCase()) ||
                p.dogNames?.toLowerCase().includes(searchString.toLowerCase())) &&
            isTypeMatching(p)
        ).sort(firstBy("lastName").thenBy("firstName"));
    }

    const isTypeMatching = (person: IPerson): boolean =>
        !type ||
        (type === "top" && person.isActive) ||
        (type === "active" && person.isActive) ||
        (type === "member" && person.isActive && person.isMember) ||
        (type === "other" && person.isActive && !person.isMember) ||
        (type === "inactive" && !person.isActive);

    const filterItems = [
        {id: "top", label: "TOP"},
        {id: "active", label: "Alle aktiven"},
        {id: "member", label: "Mitglieder"},
        {id: "other", label: "Andere"},
        {id: "inactive", label: "Inaktiv"},
    ];

    onMount(() => {
        uiState.showNavBar = false;
    });

    onDestroy(() => {
        uiState.showNavBar = true;
    });
</script>
{#await data.persons}
    <Loading></Loading>
{:then persons}
    <a href="/l/dialogs/sale">
        <Card className="mx-3 mb-8">
            <div class="flex justify-center items-center font-bold text-2xl">
                <Euro class="text-primary pr-2 h-10 w-10"/>
                Barverkauf
            </div>
        </Card>
    </a>
    <FilterBar className="px-3" items={filterItems} selected={type} parameterName="type"></FilterBar>
    <PersonsGrid persons={filter(persons)} href="/l/dialogs/sale"/>
{/await}

<PlaceAtBottom>
    <BackButton></BackButton>
    <SearchBar bind:value={searchString}></SearchBar>
</PlaceAtBottom>