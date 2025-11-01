<script lang="ts">
    import type {ISale} from "$lib/data/hfzApi";
    import {Util, rememberOrigin} from "$lib/util";
    import Card from "$lib/components/global/Card.svelte";
    import moment from "moment";

    interface IProps {
        sale: ISale;
    }

    let {sale}: IProps = $props();
</script>

<a use:rememberOrigin href="/l/dialogs/sale/{sale.id}">
    <Card>
        <div class="grid grid-cols-[1fr_auto_auto] gap-0 items-center">
            <div class="col-span-2 font-bold text-lg flex items-center">
                {sale.personName}
                {#if sale.person?.dogNames}
                    <div class="text-muted-foreground font-normal text-xs ml-2">({sale.person?.dogNames})</div>
                {/if}
            </div>
            <div class={(sale.payDate ? "text_ok text-emerald-500" : "text_warning text-amber-500")+ " text-right"}>{Util.formatCurrency(sale.articleSum)}</div>

            {#if !moment(sale.saleDate).isSame(moment(), 'day')}
                <div class="col-span-3">{Util.formatDate(sale.saleDate)}</div>
            {/if}

            <div class="col-span-3 text-sm">{sale.saleArticles.map(sa => `${sa.amount}x ${sa.articleTitle}`).join(", ")}</div>
        </div>
    </Card>
</a>
