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

    const paidSum = $derived(paidSales.map(s => s.articleSum ?? 0).reduce((a, b) => a + b, 0));
    const unpaidSum = $derived(unpaidSales.map(s => s.articleSum ?? 0).reduce((a, b) => a + b, 0));

</script>

{#snippet header(text, color, sum)}
    {#if sum}
        <div class={"px-6 sm:px-8 flex text-lg sm:text-xl font-bold "+color}>
            <div class="">{text}</div>
            <div class="flex-grow"></div>
            <div class="">{Util.formatCurrency(sum)}</div>
        </div>
    {/if}
{/snippet}
{#snippet grid(entries)}
    <Grid minColumnWidth="16em">
        {#each entries as entry}
            <SalesGridEntry sale={entry}/>
        {/each}
    </Grid>
    {/snippet} 

<div class="h-4"/>
{@render header('Offen', 'text-warning', unpaidSum)}
{@render grid(unpaidSales)}

{#if paidSum && unpaidSum}
    <div class="h-8"/>
{/if}
{@render header('Bezahlt', 'text-ok', paidSum)}
{@render grid(paidSales)}
