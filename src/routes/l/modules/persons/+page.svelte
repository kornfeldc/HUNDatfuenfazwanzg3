<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonsGrid from "$lib/components/persons/PersonsGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {ArticleTypes, type IPerson} from "$lib/data/hfzApi";
    import { uiState } from "$lib/stores/uiState.svelte";

    import thenby from 'thenby';
    const {firstBy} = thenby;

    let {data}: { data: any } = $props();
    import { page } from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    let type = $derived($page.url.searchParams.get("type") ?? "active");
    
    const filter = (persons: Array<IPerson>) => {
        return persons.filter((p: IPerson) =>
            (p.lastName?.toLowerCase().includes(uiState.searchString.toLowerCase()) ||
            p.firstName?.toLowerCase().includes(uiState.searchString.toLowerCase()) ||
            p.dogNames?.toLowerCase().includes(uiState.searchString.toLowerCase())) &&
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
    <AddButton slot="actions" href="/l/dialogs/person"></AddButton>
</NavigationActions>
