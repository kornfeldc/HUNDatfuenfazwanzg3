<script lang="ts">
    import {page} from '$app/stores';
    import type {IArticle, ISale, ISoldArticleAggregate} from "$lib/data/hfzApi";
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import TextButton from "$lib/components/global/TextButton.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import SaleArticles from "$lib/components/sales/SaleArticles.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";

    let id = $page.params.id;

    let {data}: { data: any; } = $props();
    let sale = $state({} as ISale);
    let articles = $state([] as IArticle[]);
    let topSoldArticles = $state([] as ISoldArticleAggregate[]);

    let isSearchVisible = $state(false);

    const loadData = async () => {
        articles = await data.articles;
        sale = await data.sale;
        topSoldArticles = await data.topSoldArticles;
    }

    const toggleSearch = (isVisible: boolean) => {
        isSearchVisible = isVisible;
    }
</script>
{#await loadData()}
    <Loading></Loading>
{:then _}
    <form method="post" action={`/l/dialogs/sale/${id ?? ''}`}>
        {#if (!isSearchVisible || !uiState.isMobileDevice) && sale.person}
            <Card className="max-w-xl m-auto">
                <PersonOverview person={sale.person}></PersonOverview>
            </Card>
        {/if}

        <Card className="max-w-xl m-auto">
            <SaleArticles {sale} {articles} {topSoldArticles} {toggleSearch}
                          showTopLine={!isSearchVisible || !uiState.isMobileDevice}></SaleArticles>
        </Card>

        {#if !isSearchVisible}
            <PlaceAtBottom>
                <BackButton></BackButton>
            </PlaceAtBottom>
            <NavigationActions>
                <div slot="actions">
                    {#if !sale.payDate && sale.saleArticles.length > 0}
                        <button type="submit" name="redirectTo" value={`/l/dialogs/sale/${id}/pay`}>
                            <TextButton className={"bg-primary!"}>Bezahlen</TextButton>
                        </button>
                        {#if sale.person}
                            <button type="submit" name="redirectTo" value="/l/modules/sales">
                                <TextButton color="ok">Speichern</TextButton>
                            </button>
                        {/if}
                    {/if}
                </div>
            </NavigationActions>
        {/if}
    </form>
{/await}
