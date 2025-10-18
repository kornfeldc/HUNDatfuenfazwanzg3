<script lang="ts">
    import type {ISale} from "$lib/data/hfzApi";
    import {Util} from "$lib/util";
    import Card from "$lib/components/global/Card.svelte";
    import moment from "moment";

    interface IProps {
        sale: ISale;
    }

    let {sale}: IProps = $props();
</script>

<a href="/l/dialogs/sale/{sale.id}">
    <Card>
        <div class="flex items-center">
            <div class="whitespace-nowrap font-bold text-lg">{sale.personName}</div>
            {#if sale.person?.dogNames}
                <div class="whitespace-nowrap text-muted-foreground text-xs ml-3">({sale.person?.dogNames})</div>
            {/if}
            <div class={(sale.payDate ? "text_ok text-emerald-500" : "text_warning text-amber-500")+ " w-full text-right"}>{Util.formatCurrency(sale.articleSum)}</div>
        </div>
        {#if !moment(sale.saleDate).isSame(moment(), 'day')}
            <div>{Util.formatDate(sale.saleDate)}</div>
        {/if}
        <div class="text-sm">{sale.saleArticles.map(sa => `${sa.amount}x ${sa.articleTitle}`).join(", ")}</div>
    </Card>
</a>
