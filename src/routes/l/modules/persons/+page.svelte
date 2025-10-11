<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonsGrid from "$lib/components/persons/PersonsGrid.svelte";
    import AddButton from "$lib/components/global/AddButton.svelte";
    import SearchButton from "$lib/components/global/SearchButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import type {IPerson} from "$lib/data/hfzApi";

    let {data}: { data: any } = $props();
    let searchString = $state("");
    const onSearch = (value: string) => {
        searchString = value;
    }

    const filter = (persons: Array<IPerson>) => {
        return persons.filter((p: IPerson) =>
            p.lastName?.toLowerCase().includes(searchString.toLowerCase()) ||
            p.firstName?.toLowerCase().includes(searchString.toLowerCase()) ||
            p.dogNames?.toLowerCase().includes(searchString.toLowerCase())
        );
    }
</script>
{#await data.persons}
    <Loading></Loading>
{:then persons}
    <PersonsGrid persons={filter(persons)}/>
{/await}

<NavigationActions>
    <SearchButton slot="persistent" {onSearch}></SearchButton>
    <AddButton slot="actions" href="/l/dialogs/person"></AddButton>
</NavigationActions>
