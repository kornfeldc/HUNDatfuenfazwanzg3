<script lang="ts">
    import {page} from '$app/stores';
    import type {IArticle, ISale, ISoldArticleAggregate} from "$lib/data/hfzApi";
    import {BadgeCheck, Check, Euro, History, Trash} from '@lucide/svelte';
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import SaleArticles from "$lib/components/sales/SaleArticles.svelte";
    import PaidSaleInfo from "$lib/components/sales/PaidSaleInfo.svelte";
    import { enhance } from '$app/forms';
    import { breadcrumbStore } from '$lib/stores/breadcrumbStore.svelte';

    let id = $page.params.id;

    let {data}: { data: any; } = $props();
    let sale = $state({} as ISale);
    let articles = $state([] as IArticle[]);
    let topSoldArticles = $state([] as ISoldArticleAggregate[]);

    let submitting = $state(false);

    const loadData = async () => {
        articles = await data.articles;
        sale = await data.sale;
        topSoldArticles = await data.topSoldArticles;
        breadcrumbStore.detailLabel = sale.person
            ? (sale.person.firstName + ' ' + sale.person.lastName).trim()
            : (sale.personName || 'Neuer Verkauf');
    }

    const articleSum = $derived(sale.saleArticles?.reduce((acc, sa) => acc + sa.amount * sa.articlePrice, 0) ?? 0);

    const canPayWithCredit = $derived(!sale.payDate && sale.person?.credit >= articleSum);
</script>
{#await loadData()}
    <Loading></Loading>
{:then _}
    <form id="saleForm" method="post" action="?/save" use:enhance={() => {
        submitting = true;
        return async ({ update }) => {
            await update();
            submitting = false;
        };
    }}>
        <input type="hidden" name="saleArticles"
               value={JSON.stringify(sale.saleArticles, (key, value) => key === 'sale' ? undefined : value)}/>
        <input type="hidden" name="articleSum" value={articleSum}/>
        <input type="hidden" name="personId" value={sale.person?.id}/>

        {#if sale.person}
            <Card className="max-w-xl m-auto">
                <PersonOverview person={sale.person}></PersonOverview>
            </Card>
        {/if}

        <Card className="mt-2 max-w-xl m-auto">
            <SaleArticles {sale} {articles} {topSoldArticles}></SaleArticles>
        </Card>

        {#if sale.payDate}
            <PaidSaleInfo {sale}></PaidSaleInfo>
        {/if}

        <BackButton></BackButton>
        {#if id}
            <PlaceAtBottom>
                <a href={`/l/dialogs/history/sale/${id}`} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-foreground hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <History class="w-7 h-7"/>
                </a>
            </PlaceAtBottom>
            <PlaceAtBottom>
                <button type="submit" form="saleForm" name="deleteAction" value="true" class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-destructive cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <Trash class="w-7 h-7"/>
                </button>
            </PlaceAtBottom>
        {/if}
        {#if !sale.payDate && sale.saleArticles?.length > 0}
            {#if canPayWithCredit}
                <PlaceAtBottom>
                    <button type="submit" form="saleForm" formaction="?/payWithCredit" class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-ok cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                        <BadgeCheck class="w-7 h-7"/>
                    </button>
                </PlaceAtBottom>
            {/if}
            <PlaceAtBottom>
                <button type="submit" form="saleForm" name="redirectTo" value={`/l/dialogs/sale//pay`} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-ok cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <Euro class="w-7 h-7"/>
                </button>
            </PlaceAtBottom>
            {#if sale.person}
                <PlaceAtBottom>
                    <button type="submit" form="saleForm" name="redirectTo" value="/l/modules/sales" class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                        <Check class="w-7 h-7"/>
                    </button>
                </PlaceAtBottom>
            {/if}
        {/if}
    </form>
{/await}

{#if submitting}
    <Loading/>
{/if}
