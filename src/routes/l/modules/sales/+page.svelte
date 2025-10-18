<script lang="ts">
    import SalesGrid from "$lib/components/sales/SalesGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SearchButton from "$lib/components/global/NavigationButtons/SearchButton.svelte";
    import type {ISale} from "$lib/data/hfzApi";
    import Pill from "$lib/components/global/Pill.svelte";
    import {CalendarDays} from "@lucide/svelte";

    let {data}: { data: any } = $props();
    let searchString = $state("");

    import { page } from '$app/stores';
    import moment from "moment";
    let date = $derived($page.url.searchParams.get("date") ?? moment().format("YYYY-MM-DD"));
    let formattedDate = $derived(moment(date).format("dddd, DD.MM.YYYY"));
    
    const onSearch = (value: string) => {
        searchString = value;
    }

    const filter = (sales: Array<ISale>) => {
        return sales.filter((s: ISale) =>
            (s.personName?.toLowerCase().includes(searchString.toLowerCase()) ||
            s.person?.dogNames?.toLowerCase().includes(searchString.toLowerCase())) &&
            isSaleOnDate(s)
        );
    }
    
    const isSaleOnDate = (sale: ISale) => moment(sale.saleDate).isSame(moment(date), "day"); 
</script>
{#await data.sales}
    loading ...
{:then sales}
    <div class="flex w-full justify-center">
        <a href="/l/modules/calendar">
            <Pill selected={false} className="flex items-center gap-2 p-2 px-4">
                <CalendarDays/>
                {formattedDate}
            </Pill>
        </a>
    </div>
    <SalesGrid sales={filter(sales)}/>
{/await}

<NavigationActions>
    <SearchButton slot="persistent" {onSearch}></SearchButton>
    <AddButton slot="actions" href="/l/dialogs/sale"></AddButton>
</NavigationActions>
