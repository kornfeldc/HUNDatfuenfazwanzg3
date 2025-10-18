<script lang="ts">
    import type {ISale, ISaleArticle} from "$lib/data/hfzApi";
    import {Util} from "$lib/util";
    import {Minus, Plus} from "@lucide/svelte";
    import GlassCircle from "$lib/components/global/GlassCircle.svelte";
    import moment from "moment";

    interface IProps {
        sale: ISale;
    }

    let {sale}: IProps = $props();

    const addOrRemove = (event: any, saleArticle: ISaleArticle, amount = 1) => {
        let match = sale.saleArticles.find(sa => sa.article.id === saleArticle.article.id);
        if (match && amount > 0)
            match.amount += amount;
        else if (match && match.amount > 1 && amount < 0)
            match.amount += amount;
        else if (match && match.amount === 1 && amount < 0)
            sale.saleArticles = sale.saleArticles.filter(sa => sa.article.id !== saleArticle.article.id);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    const sum = $derived(sale.saleArticles.reduce((acc, sa) => acc + sa.amount * sa.articlePrice, 0));

</script>

<div class="grid [grid-template-columns:1fr_auto_auto_auto_auto] gap-2 items-center">
    {#if !sale.payDate}
        <GlassCircle
                className="col-span-2 ml-[-0.5em] mt-2 h-8! px-4! bg-transparent! text-primary border-[1px] border-primary drop-shadow-primary/40 drop-shadow-lg whitespace-nowrap w-min">
            Artikel hinzufügen
        </GlassCircle>
    {:else}
        <div class="col-span-2 text-lg pt-2">
            {moment(sale.saleDate).format('DD.MM.YYYY')}
        </div>
    {/if}
    <div class="mt-2 col-span-3 text-xl text-right font-bold">
        {Util.formatCurrency(sum)}
    </div>
    <div class="col-span-5 border-b-[1px] border-b-muted pt-1 mb-1 "></div>

    {#each sale.saleArticles as saleArticle}
        <div class="w-full">{saleArticle.articleTitle}</div>
        {#if !sale.payDate}
            <button onclick={(event) => addOrRemove(event,saleArticle, -1)}>
                <Minus class="bg-destructive rounded-full text-destructive-foreground w-9 h-9 p-1.5"/>
            </button>
        {:else}
            <div/>
        {/if}
        <div class="sm:px-1">{saleArticle.amount}x</div>
        {#if !sale.payDate}
            <button onclick={(event) => addOrRemove(event,saleArticle, 1)}>
                <Plus class="bg-ok rounded-full text-ok-foreground w-9 h-9 p-1.5"/>
            </button>
        {:else}
            <div/>
        {/if}
        <div class="whitespace-nowrap pl-1 text-right">{Util.formatCurrency(saleArticle.amount * saleArticle.articlePrice)}</div>
    {/each}
</div>
