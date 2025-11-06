<script lang="ts">
    import {ArticleTypes, type IArticle, type ISale, type ISaleArticle} from "$lib/data/hfzApi";
    import {Util} from "$lib/util";
    import {Check, Minus, Plus} from "@lucide/svelte";
    import GlassCircle from "$lib/components/global/GlassCircle.svelte";
    import moment from "moment";
    import SearchBar from "$lib/components/global/SearchBar.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import {onMount} from "svelte";

    interface IProps {
        sale: ISale;
        articles: IArticle[];
        toggleSearch: (isVisible: boolean) => void;
        showTopLine?: boolean;
    }

    let {sale, articles, toggleSearch, showTopLine = true}: IProps = $props();
    let showAllArticles = $state(false);
    let searchString = $state("");
    let type = $state("top");

    const filterItems = [
        {id: "top", label: "TOP"},
        {id: "all", label: "Alle"},
        {id: "favorite", label: "Favoriten"},
        ...Object.keys(ArticleTypes).map((t) => ({id: t, label: ArticleTypes[t]})),
        {id: "inactive", label: "Inaktiv"}
    ];

    const addOrRemove = (event: any, articleId: number, amount = 1) => {
        let match = sale.saleArticles.find(sa => sa.article.id === articleId);
        if (match && amount > 0)
            match.amount += amount;
        else if (match && match.amount > 1 && amount < 0)
            match.amount += amount;
        else if (match && match.amount === 1 && amount < 0)
            sale.saleArticles = sale.saleArticles.filter(sa => sa.article.id !== articleId);
        else if (!match) {
            const article = articles.find(a => a.id === articleId);
            sale.saleArticles.push({
                sale,
                article,
                articleTitle: article.title,
                articlePrice: article.price,
                amount: 1
            });
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    const setShowAllArticles = (event: any) => {
        showAllArticles = true;
        if (toggleSearch) toggleSearch(true);
        event?.stopPropagation();
        event?.preventDefault();
        return false;
    }

    const sum = $derived(sale.saleArticles.reduce((acc, sa) => acc + sa.amount * sa.articlePrice, 0));

    const articleList = $derived.by(() => {
        let ret = [...sale.saleArticles];
        if (showAllArticles) {
            const virtualSaleArticles = articles
                .filter(a => !sale.saleArticles.find(sa => sa.article.id === a.id))
                .map(a => {
                    return {
                        article: a,
                        articleTitle: a.title,
                        articlePrice: a.price,
                        amount: 0,
                        sale: null
                    } as ISaleArticle;
                });
            ret = [...ret, ...virtualSaleArticles];
        }

        return ret
            .filter(a =>
                !showAllArticles ||
                (type === "all" && a.article.isActive) ||
                (type === "top" && true) ||
                a.article.type === type ||
                (type === "favorite" && a.article.isFavorite) ||
                (type === "inactive" && !a.article.isActive))
            .filter(a => !searchString || a.articleTitle.toLowerCase().indexOf(searchString.toLowerCase()) >= 0);
    });

    const closeSearch = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        searchString = "";
        showAllArticles = false;
        toggleSearch(false);
        return false;
    }


    onMount(() => {
        if (sale.id) return;
        setShowAllArticles(null);
    });
</script>

<div class="grid [grid-template-columns:1fr_auto_auto_auto_auto] gap-2 items-center h-full">
    {#if showTopLine}
        {#if !sale.payDate}
            <button class="col-span-2" onclick={(event) => setShowAllArticles(event)}>
                <GlassCircle
                        className="ml-[-0.5em] mt-2 h-8! px-4! bg-transparent! text-primary border-[1px] border-primary drop-shadow-primary/40 drop-shadow-lg whitespace-nowrap w-min">
                    Artikel hinzufügen
                </GlassCircle>
            </button>
        {:else}
            <div class="col-span-2 text-lg pt-2">
                {moment(sale.saleDate).format('DD.MM.YYYY')}
            </div>
        {/if}
        <div class="mt-2 col-span-3 text-xl text-right font-bold">
            {Util.formatCurrency(sum)}
        </div>
        <div class="col-span-5 border-b-[1px] border-b-muted pt-1 mb-1 "></div>
    {/if}

    {#if showAllArticles}
        <div class="col-span-5">
            <FilterBar items={filterItems} selected={type} parameterName="type"
                       onSelected={(selectedType)=> type = selectedType}></FilterBar>
        </div>
        <div class="col-span-5 border-b-[1px] border-b-muted pt-1 mb-1 "></div>
    {/if}

    {#each articleList as saleArticle}
        <div class={Util.mapClass("w-full", !!saleArticle.sale, "", "" )}>{saleArticle.articleTitle}</div>
        {#if !sale.payDate}
            <button onclick={(event) => addOrRemove(event,saleArticle.article.id, -1)}>
                <Minus class="bg-destructive rounded-full text-destructive-foreground w-9 h-9 p-1.5"/>
            </button>
        {:else}
            <div></div>
        {/if}
        <div class={Util.mapClass("sm:px-1", !saleArticle.sale, "text-muted-foreground")}>{saleArticle.amount}x</div>
        {#if !sale.payDate}
            <button onclick={(event) => addOrRemove(event,saleArticle.article.id, 1)}>
                <Plus class="bg-ok rounded-full text-ok-foreground w-9 h-9 p-1.5"/>
            </button>
        {:else}
            <div></div>
        {/if}
        <div class={Util.mapClass("whitespace-nowrap pl-1 text-right", !saleArticle.sale, "text-muted-foreground")}>{Util.formatCurrency(saleArticle.amount * saleArticle.articlePrice)}</div>
    {/each}
</div>

{#if showAllArticles}
    <PlaceAtBottom top={true}>
        <SearchBar bind:value={searchString}/>
    </PlaceAtBottom>

    <PlaceAtBottom at="right" top={true}>
        <button onclick={closeSearch}>
            <GlassCircle
                    className="bg-primary/70! text-primary-foreground! border-primary! drop-shadow-primary/40 drop-shadow-lg">
                <Check></Check>
            </GlassCircle>
        </button>
    </PlaceAtBottom>
{/if}