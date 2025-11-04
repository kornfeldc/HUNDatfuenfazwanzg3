<script lang="ts">
    import {page} from '$app/stores';
    import type {IArticle, IPerson, ISale} from "$lib/data/hfzApi";
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import TextButton from "$lib/components/global/TextButton.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import SaleArticles from "$lib/components/sales/SaleArticles.svelte";

    let id = $page.params.id;

    let {data}: { data: any; } = $props();
    let sale = $state({} as ISale);
    let articles = $state([] as IArticle[]);

    let isSearchVisible = $state(false);

    const loadData = async () => {
        articles = await data.articles;
        if(id)  
            sale = await data.sale;
        else {
            const person = await data.person;
            sale = {
                id: 0,
                saleArticles: [],
                saleDate: new Date(),
                person,
                articleSum: 0,
                given: 0,
                additionalCredit: 0,
                extId: "",
                inclTip: 0,
                personName: person.lastName + " " + person.firstName, 
                payDate: undefined,
                toPay: 0,
                toReturn: 0,
                usedCredit: false
            } as ISale;
        }
    }

    const toggleSearch = (isVisible: boolean) => {
        isSearchVisible = isVisible;
    }
</script>
{#await loadData()}
    <Loading></Loading>
{:then _}
    <form method="post" action={`/l/dialogs/sale/${id ?? ''}`}>
        <Card className="max-w-xl m-auto">
            <PersonOverview person={sale.person}></PersonOverview>
        </Card>

        <Card className="max-w-xl m-auto">
            <SaleArticles {sale} {articles} {toggleSearch}></SaleArticles>
        </Card>

        {#if !isSearchVisible}
            <PlaceAtBottom>
                <BackButton></BackButton>
            </PlaceAtBottom>
            <NavigationActions>
                <div slot="actions">
                    {#if !sale.payDate}
                        <button type="submit" name="redirectTo" value={`/l/dialogs/sale/${id}/pay`}>
                            <TextButton className={"bg-primary!"}>Bezahlen</TextButton>
                        </button>
                        <button type="submit" name="redirectTo" value="/l/modules/sales">
                            <TextButton color="ok">Speichern</TextButton>
                        </button>
                    {/if}
                </div>
            </NavigationActions>
        {/if}
    </form>
{/await}
