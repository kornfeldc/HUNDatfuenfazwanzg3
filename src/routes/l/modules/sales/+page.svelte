<script lang="ts">
    import SalesGrid from "$lib/components/sales/SalesGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SearchButton from "$lib/components/global/NavigationButtons/SearchButton.svelte";
    import type {ISale} from "$lib/data/hfzApi";

    let {data}: { data: any } = $props();
    let searchString = $state("");
    const onSearch = (value: string) => {
        searchString = value;
    }

    const filter = (sales: Array<ISale>) => {
        return sales.filter((s: ISale) =>
            s.personName?.toLowerCase().includes(searchString.toLowerCase()) ||
            s.person?.dogNames?.toLowerCase().includes(searchString.toLowerCase())
        );
    }
</script>
{#await data.sales}
    loading ...
{:then sales}
    <SalesGrid sales={filter(sales)}/>
{/await}

<NavigationActions>
    <SearchButton slot="persistent" {onSearch}></SearchButton>
    <AddButton slot="actions" href="/l/dialogs/sale"></AddButton>
</NavigationActions>
