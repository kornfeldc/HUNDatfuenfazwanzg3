<script lang="ts">
    import type {ISale} from "$lib/data/hfzApi";
    import {Util} from "$lib/util";
    import Card from "$lib/components/global/Card.svelte";
    import moment from "moment";

    interface IProps {
        sale: ISale;
    }

    let {sale}: IProps = $props();
    
    let usedCreditAmount = $derived.by(()=> {
        if(!sale.usedCredit) return 0; 
        return sale.articleSum - sale.toPay;
    });
    
    let creditChange = $derived.by(() => {
        return (usedCreditAmount*-1) + sale.addAdditionalCredit;
    }); 
    
    let tip = $derived(sale.inclTip - sale.toPay);
</script>

{#snippet infoLine(label, value, renderCondition, className = "")}
    {#if renderCondition}
    <div class="w-full text-muted-foreground">
        {label}
    </div>
    <div class={"text-right font-semibold "+className}>
        {value}
    </div>
    {/if}
{/snippet}

<Card>
    <div class="grid grid-cols-2 gap-4 mt-2">
        {@render infoLine("Bezahlt am", moment(sale.payDate).format("DD.MM.YYYY"), true)}
        {@render infoLine("Artikel gekauft", Util.formatCurrency(sale.articleSum), !!sale.articleSum)}
        {@render infoLine("Retour", Util.formatCurrency(sale.toReturn), !!sale.toReturn)}
        {@render infoLine("Gegeben", Util.formatCurrency(sale.given), !!sale.given)}
        {@render infoLine("Trinkggeld", Util.formatCurrency(tip), !!tip)}
        {@render infoLine("Guthaben verwendet", Util.formatCurrency(usedCreditAmount*-1), !!usedCreditAmount, "text-warning")}
        {@render infoLine("Guthaben aufgeladen", Util.formatCurrency(sale.addAdditionalCredit), !!sale.addAdditionalCredit, "text-primary")}
        {#if creditChange}
            <div class="col-span-2 w-full border-t-2 border-border"></div>
        {/if}
        {@render infoLine("Guthaben +/-", Util.formatCurrency(creditChange), !!creditChange, creditChange > 0 ? "text-green-500" : "text-red-500")}
    </div>
</Card>
