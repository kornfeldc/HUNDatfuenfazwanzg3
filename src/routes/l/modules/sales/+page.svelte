<script lang="ts">
    import SalesGrid from "$lib/components/sales/SalesGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SearchButton from "$lib/components/global/NavigationButtons/SearchButton.svelte";
    import type {ISale} from "$lib/data/hfzApi";
    import Pill from "$lib/components/global/Pill.svelte";
    import {CalendarDays, CircleArrowLeft, CircleArrowRight} from "@lucide/svelte";
    import thenby from 'thenby';
    const { firstBy } = thenby;
    import { page } from '$app/stores';
    import moment from "moment";

    let {data}: { data: any } = $props();
    let searchString = $state("");
    let sales = $state([] as Array<ISale>);

    moment.locale('de');
    
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
        ).sort(firstBy("personName"));
    }
    
    const isSaleOnDate = (sale: ISale) => 
        moment(sale.saleDate).isSame(moment(date), "day") ||
        (moment(date).isSame(moment(),"day") && !sale.payDate);  
    
    const loadSales = async () => {
        sales = await data.sales; 
        console.log("sales", sales);    
    }
</script>
{#await loadSales()}
    loading ...
{:then _}
    <div class="flex w-full items-center justify-center">
        <a href={"/l/modules/sales?date="+moment(date).subtract(1, "days").format("YYYY-MM-DD")}>
            <CircleArrowLeft class="text-slate-400" />
        </a>
        <a href={"/l/modules/calendar?date="+date}>
            <Pill selected={false} className="flex items-center justify-center gap-2 p-2 px-4 w-56 mx-4">
                <CalendarDays/>
                {formattedDate}
            </Pill>
        </a>
        <a href={"/l/modules/sales?date="+moment(date).add(1, "days").format("YYYY-MM-DD")}>
            <CircleArrowRight class="text-slate-400"/>
        </a>
    </div>
    <SalesGrid sales={filter(sales)}/>
{/await}

<NavigationActions>
    <SearchButton slot="persistent" {onSearch}></SearchButton>
    <AddButton slot="actions" href="/l/dialogs/sale"></AddButton>
</NavigationActions>
