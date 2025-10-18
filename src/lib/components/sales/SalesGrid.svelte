<script lang="ts">
    import type {ISale} from "$lib/data/hfzApi";
    import SalesGridEntry from "./SalesGridEntry.svelte";
    import Grid from "$lib/components/global/Grid.svelte";
    import {Util} from "$lib/util";

    interface IProps {
        sales: Array<ISale>;
    }

    let {sales}: IProps = $props();

    let paidSales = $derived(sales.filter(s => s.payDate));
    let unpaidSales = $derived(sales.filter(s => !s.payDate));
    
    const paidSum = $derived(paidSales.map(s=> s.toPay ?? 0).reduce((a,b) => a + b, 0));
    const unpaidSum = $derived(unpaidSales.map(s=> s.toPay ?? 0).reduce((a,b) => a + b, 0));

</script>


{#if unpaidSum}
    <div class="px-8 flex text-xl font-bold text-amber-500">
        <div class="">Offen</div>
        <div class="flex-grow"></div>
        <div class="">{Util.formatCurrency(unpaidSum)}</div>
    </div>
{/if}
<Grid minColumnWidth="16em">
    {#each unpaidSales as sale}
        <SalesGridEntry {sale}/>
    {/each}
</Grid>

{#if paidSum && unpaidSum}
    <div class="h-8"/>
{/if}

{#if paidSum}
    <div class="px-8 flex text-xl font-bold text-ok">
        <div class="">Bezahlt</div>
        <div class="flex-grow"></div>
        <div class="">{Util.formatCurrency(paidSum)}</div>
    </div>
{/if}
<Grid minColumnWidth="16em">
    {#each paidSales as sale}
        <SalesGridEntry {sale}/>
    {/each}
</Grid>
