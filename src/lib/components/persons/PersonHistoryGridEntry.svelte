<script lang="ts">
    import type {IMergedPersonHistory} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Util, moment} from "$lib/util";

    interface IProps {
        historyEntry: IMergedPersonHistory;
        type: string;
    }

    let {historyEntry, type}: IProps = $props();

    let href = $derived.by(() => {
        if (historyEntry?.saleHistory?.length === 0) return "javascript:void(0);";
        return `/l/dialogs/sale/${historyEntry.saleHistory?.[0]?.id}`;
    });
</script>
<Card {href}>
    <div class="flex align-middle">
        <div class="font-bold text-lg">
            {moment(historyEntry.date).format("ddd, DD.MM.YYYY")}
        </div>
        <div class="grow text-right whitespace-nowrap pt-0.5 ">
            {#if historyEntry.saleHistory?.length > 0}
                <span class="text-xs text-muted-foreground">Verkauf:</span>
                {Util.formatCurrency(historyEntry.saleSum)}
            {/if}
        </div>
    </div>
    <div class="flex items-center align-middle">
        <div class="grow whitespace-nowrap ">
            {#if historyEntry.courseHistory?.length > 0}
                <span class="text-xs text-muted-foreground">Kurs:</span>
                {#if historyEntry.coursesUsed}
                    <span class="text-purple-500">
                        {Util.formatCurrency(historyEntry.coursesUsed, false, 0)}
                    </span>
                {/if}
                {#if historyEntry.coursesBought && historyEntry.coursesUsed}
                    <span class="text-xs text-muted-foreground px-1">|</span>
                {/if}
                {#if historyEntry.coursesBought}
                    <span class="text-blue-500">
                        +{Util.formatCurrency(historyEntry.coursesBought, false, 0)}
                    </span>
                {/if}
            {/if}
        </div>
        <div class="grow text-right whitespace-nowrap ">
            {#if historyEntry.creditHistory?.length > 0}
                <span class="text-xs text-muted-foreground">Guth.:</span>
                {#if historyEntry.creditBought}
                    <span class="text-ok">
                        {Util.formatCurrency(historyEntry.creditBought, true, 1)}
                    </span>
                {/if}
                {#if historyEntry.creditBought && historyEntry.creditUsed}
                    <span class="text-xs text-muted-foreground px-1">|</span>
                {/if}
                {#if historyEntry.creditUsed}
                    <span class="text-warning">
                        {Util.formatCurrency(historyEntry.creditUsed, true, 1)}
                    </span>
                {/if}
            {/if}
        </div>
    </div>
</Card>