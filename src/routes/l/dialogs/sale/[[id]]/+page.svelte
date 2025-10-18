<script lang="ts">
    import {page} from '$app/stores';
    import type {ISale} from "$lib/data/hfzApi";
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import TextButton from "$lib/components/global/TextButton.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";

    let id = $page.params.id;

    let {data}: { data: any; } = $props();
    let sale = $state({} as ISale);

    const loadSale = async () => {
        sale = await data.sale;
    }
</script>
{#await loadSale()}
    <Loading></Loading>
{:then _}
    <form method="post" action="/l/dialogs/sale/{id}">
        <Card className="max-w-xl m-auto">
            <PersonOverview person={sale.person}></PersonOverview>
        </Card>

        <Card className="max-w-xl m-auto">
            articles
        </Card>

        <PlaceAtBottom>
            <BackButton></BackButton>
        </PlaceAtBottom>
        <NavigationActions>
            <div slot="actions">
                <button type="submit">
                    <TextButton>Bezahlen</TextButton>
                </button>
                <button type="submit">
                    <TextButton color="ok">Speichern</TextButton>
                </button>
            </div>
        </NavigationActions>
    </form>
{/await}
