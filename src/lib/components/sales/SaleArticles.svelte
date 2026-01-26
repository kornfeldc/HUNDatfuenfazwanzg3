<script lang="ts">
    import {
        ArticleTypes,
        type IArticle,
        type ISale,
        type ISaleArticle,
        type ISoldArticleAggregate
    } from "$lib/data/hfzApi";
    import {Util, moment} from "$lib/util";
    import {Check, Minus, Plus} from "@lucide/svelte";
    import GlassCircle from "$lib/components/global/GlassCircle.svelte";
    import SearchBar from "$lib/components/global/SearchBar.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import {onMount} from "svelte";

    interface IProps {
        sale: ISale;
        articles: IArticle[];
        topSoldArticles?: ISoldArticleAggregate[];
        toggleSearch: (isVisible: boolean) => void;
        showTopLine?: boolean;
    }

    let {sale, articles, topSoldArticles, toggleSearch, showTopLine = true}: IProps = $props();
    let showAllArticles = $state(false);
    let searchString = $state("");
    let type = $state("top");
    let initialSaleArticleIds = $state<number[]>([]);

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
        initialSaleArticleIds = sale.saleArticles.map(sa => sa.article.id);
        if (toggleSearch) toggleSearch(true);
        event?.stopPropagation();
        event?.preventDefault();
        return false;
    }

    const sum = $derived(sale.saleArticles.reduce((acc, sa) => acc + sa.amount * sa.articlePrice, 0));

    const articleList = $derived.by(() => {
        if (!showAllArticles) {
            return sale.saleArticles;
        }

        // 1. Get ALL potentially relevant articles as ISaleArticle (real or virtual)
        const allArticlesMapped = articles.map(a => {
            const real = sale.saleArticles.find(sa => sa.article.id === a.id);
            const sold = topSoldArticles?.find(t => t.articleId === a.id)?.count ?? 0;
            if (real) return {...real, sold};
            return {
                article: a,
                articleTitle: a.title,
                articlePrice: a.price,
                amount: 0,
                sale: null,
                sold: sold
            } as any;
        });

        // 2. Filter them
        let filtered = allArticlesMapped.filter(a => {
            // Search string filter (always apply if showAllArticles)
            if (searchString && a.articleTitle.toLowerCase().indexOf(searchString.toLowerCase()) === -1) {
                return false;
            }

            // Type filter
            if (type === "all") return a.article.isActive;
            if (type === "top") {
                // Always show articles that are currently in the sale
                if (!!a.sale) return true;

                // For virtual others:
                if ((topSoldArticles?.length ?? 0) > 0) {
                    return a.sold > 0;
                }
                return true;
            }
            if (type === "favorite") return a.article.isFavorite;
            if (type === "inactive") return !a.article.isActive;

            return a.article.type === type;
        });

        // 3. Sort them
        filtered.sort((a, b) => {
            const aInitIndex = initialSaleArticleIds.indexOf(a.article.id);
            const bInitIndex = initialSaleArticleIds.indexOf(b.article.id);

            const aIsInitial = aInitIndex !== -1;
            const bIsInitial = bInitIndex !== -1;

            // Initially real ones always on top
            if (aIsInitial && !bIsInitial) return -1;
            if (!aIsInitial && bIsInitial) return 1;

            // Both were initially real: keep their original order
            if (aIsInitial && bIsInitial) return aInitIndex - bInitIndex;

            // Both were NOT initially real (could be virtual or newly added real)
            // Sort by current filter
            if (type === "top") {
                if (b.sold !== a.sold) return b.sold - a.sold;
                return a.articleTitle.localeCompare(b.articleTitle);
            } else {
                return a.articleTitle.localeCompare(b.articleTitle);
            }
        });

        return filtered;
    });

    const closeSearch = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        searchString = "";
        showAllArticles = false;
        initialSaleArticleIds = [];
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
                        className="ml-[-0.5em] mt-2 h-8! px-4! bg-transparent! text-primary border-[1px] border-primary shadow-sm whitespace-nowrap w-min">
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
                    className="bg-primary/70! text-primary-foreground! border-0 shadow-md">
                <Check></Check>
            </GlassCircle>
        </button>
    </PlaceAtBottom>
{/if}