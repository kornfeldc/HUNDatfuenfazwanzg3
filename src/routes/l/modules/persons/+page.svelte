<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonsGrid from "$lib/components/persons/PersonsGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import SearchButton from "$lib/components/global/NavigationButtons/SearchButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {ArticleTypes, type IPerson} from "$lib/data/hfzApi";

    import thenby from 'thenby';
    const {firstBy} = thenby;

    let {data}: { data: any } = $props();
    let searchString = $state("");

    import { page } from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";
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
        ).sort(
            firstBy((person: IPerson) => person.lastName || '\uffff', { ignoreCase: true })
                .thenBy((person: IPerson) => person.firstName || '\uffff', { ignoreCase: true })
        );
    }
    
    const isTypeMatching = (person: IPerson): boolean => 
        !type ||
        (type === "active" && person.isActive) ||
        (type === "member" && person.isActive && person.isMember) ||
        (type === "other" && person.isActive && !person.isMember) ||
        (type === "inactive" && !person.isActive); 

    const filterItems = [
        {id: "active", label: "Alle aktiven"},
        {id: "member", label: "Mitglieder"},
        {id: "other", label: "Andere"},
        {id: "inactive", label: "Inaktiv"},
    ];
</script>
{#await data.persons}
    <Loading></Loading>
{:then persons}
    <FilterBar className="px-3 mb-2" items={filterItems} selected={type} parameterName="type"></FilterBar>
    <PersonsGrid persons={filter(persons)}/>
{/await}

<NavigationActions>
    <SearchButton slot="persistent" {onSearch}></SearchButton>
    <AddButton slot="actions" href="/l/dialogs/person"></AddButton>
</NavigationActions>
