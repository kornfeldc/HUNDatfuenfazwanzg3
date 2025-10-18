<script lang="ts">
    import {page} from '$app/stores';
    import type {ISale} from "$lib/data/hfzApi";
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";

    let id = $page.params.id;

    let {data}: { data: any; } = $props();
    let formSale = $state({} as ISale);

    const loadSale = async () => {
        const sale = await data.sale;
        formSale.id = sale?.id;
        // ...
    }
</script>
{#await loadSale()}
    <Loading></Loading>
{:then _}
    <form method="post" action="/l/dialogs/article/{id}">
        <Card className="max-w-xl m-auto">
            test
        </Card>
    </form>
{/await}
