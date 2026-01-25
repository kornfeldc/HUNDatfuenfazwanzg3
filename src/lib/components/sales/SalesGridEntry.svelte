<script lang="ts">
    import type {ISale} from "$lib/data/hfzApi";
    import {Util, moment} from "$lib/util";
    import Card from "$lib/components/global/Card.svelte";
    import {BadgeCheck} from "@lucide/svelte";

    interface IProps {
        sale: ISale;
    }

    let {sale}: IProps = $props();
    
    let canPayWithCredit = $derived(!sale.payDate && sale.person?.credit > sale.articleSum);
</script>

<a href="/l/dialogs/sale/{sale.id}">
    <Card>
        <div class="grid grid-cols-[1fr_auto_auto] gap-0 items-center">
            <div class="col-span-2 font-bold text-lg flex items-center">
                {sale.personName}
                {#if sale.person?.dogNames}
                    <div class="text-muted-foreground font-normal text-xs ml-2">({sale.person?.dogNames})</div>
                {/if}
            </div>
            <div class={(sale.payDate ? "text-ok" : "text-warning")+ " text-right flex justify-center items-center gap-2"}>
                {#if canPayWithCredit}
                    <BadgeCheck class="inline-block text-ok h-8"/>                    
                {/if}
                {Util.formatCurrency(sale.articleSum)}
            </div>

            {#if !moment(sale.saleDate).isSame(moment(), 'day')}
                <div class="col-span-3">{Util.formatDate(sale.saleDate)}</div>
            {/if}

            <div class="col-span-3 text-sm">{sale.saleArticles.map(sa => `${sa.amount}x ${sa.articleTitle}`).join(", ")}</div>
        </div>
    </Card>
</a>
