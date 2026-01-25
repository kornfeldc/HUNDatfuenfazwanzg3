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
    import Loading from "$lib/components/global/Loading.svelte";
    import TextButton from "$lib/components/global/TextButton.svelte";

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
    }
    
    const salesThatCanBePayedWithCredit = $derived.by(() => filter(sales).filter((s: ISale) => !s.payDate && s.person && s.person.credit > s.articleSum));
    
</script>
{#await loadSales()}
    <Loading/>
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
    <div slot="actions">
        <AddButton href="/l/modules/personChooser"></AddButton>
        {#if salesThatCanBePayedWithCredit.length > 0}
            <div class="fixed bottom-20 left-0 w-full z-10 flex justify-center">
                <TextButton className={"bg-transparent! border-2 border-ok text-ok! whitespace-nowrap w-min px-4"}>Alle mit GH bezahlen</TextButton>
            </div>
        {/if}
    </div>
</NavigationActions>
