<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonsGrid from "$lib/components/persons/PersonsGrid.svelte";
    import {type IPerson, type IPersonSaleAggregate} from "$lib/data/hfzApi";
    import {Euro} from "@lucide/svelte";

    import thenby from 'thenby';
    import {page} from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import {onDestroy} from "svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import SearchBar from "$lib/components/global/SearchBar.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import Card from "$lib/components/global/Card.svelte";

    const {firstBy} = thenby;

    let {data}: { data: any } = $props();
    let searchString = $state("");
    let persons = $state([] as Array<IPerson>);
    let topPersons = $state([] as Array<IPersonSaleAggregate>);

    let type = $derived($page.url.searchParams.get("type") ?? "active");

    
    const loadData = async () => {
        persons = await data.persons;
        topPersons = await data.topPersons; 
    }

    const filter = (persons: Array<IPerson>) => {
        const topSortMethod = (a: IPerson, b: IPerson) => {
            const topPersonA = topPersons.find(tp => tp.personId === a.id);
            const topPersonB = topPersons.find(tp => tp.personId === b.id);
            if (!topPersonA && !topPersonB) return 0;
            if (!topPersonA) return 1;
            if (!topPersonB) return -1;
            return topPersonB.count - topPersonA.count;
        };
        
        const sortMethod = type === "top" ? topSortMethod :
            firstBy((person: IPerson) => person.lastName || '\uffff', { ignoreCase: true }) 
                .thenBy((person: IPerson) => person.firstName || '\uffff', { ignoreCase: true });
        
        return persons.filter((p: IPerson) =>
            (p.lastName?.toLowerCase().includes(searchString.toLowerCase()) ||
                p.firstName?.toLowerCase().includes(searchString.toLowerCase()) ||
                p.dogNames?.toLowerCase().includes(searchString.toLowerCase())) &&
            isTypeMatching(p)
        ).sort(sortMethod);
    }

    const isTypeMatching = (person: IPerson): boolean =>
        !type ||
        (type === "top" && person.isActive && topPersons?.some(tp => tp.personId === person.id)) ||
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

    if (typeof window !== 'undefined') {
        uiState.setNavSearch(true);
    }

    onDestroy(() => {
        uiState.setNavSearch(false);
    });
</script>
{#await loadData()}
    <Loading></Loading>
{:then _}
    <a href="/l/dialogs/sale">
        <Card className="m-2 my-4">
            <div class="flex justify-center items-center font-bold text-2xl">
                <Euro class="text-primary pr-2 h-10 w-10"/>
                Barverkauf
            </div>
        </Card>
    </a>
    <FilterBar className="px-3 pb-2" items={filterItems} selected={type} parameterName="type"></FilterBar>
    <PersonsGrid persons={filter(persons)} href="/l/dialogs/sale" openMainPerson={true}/>
{/await}

<PlaceAtBottom>
    <BackButton></BackButton>
    <SearchBar bind:value={searchString}></SearchBar>
</PlaceAtBottom>