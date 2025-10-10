<script lang="ts">
    import type {ISale} from "$lib/data/hfzApi";
    import {Util} from "$lib/util";

    interface IProps {
        sale: ISale;
    }

    let {sale}: IProps = $props();
</script>

<div class="m-4 p-4 shadow-lg shadow-slate-300 rounded-lg">
    <div class="flex items-center">
        <div class="whitespace-nowrap font-bold text-lg">{sale.personName}</div>
        {#if sale.person?.dogNames}
            <div class="whitespace-nowrap text-muted-foreground text-xs ml-3">({sale.person?.dogNames})</div>
        {/if}
        <div class={(sale.payDate ? "text_ok text-emerald-500" : "text_warning text-amber-500")+ " w-full text-right"}>{Util.formatCurrency(sale.articleSum)}</div>
    </div>
    <div>{Util.formatDate(sale.saleDate)}</div>
    <div>{sale.saleArticles.map(sa => `${sa.amount}x ${sa.articleTitle}`).join(", ")}</div>
</div>