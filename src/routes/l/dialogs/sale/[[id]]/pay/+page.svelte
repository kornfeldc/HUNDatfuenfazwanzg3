<script lang="ts">
    import {page} from '$app/stores';
    import type {ISale} from "$lib/data/hfzApi";
    import Loading from "$lib/components/global/Loading.svelte";

    let id = $page.params.id;
    let {data}: { data: any; } = $props();

    let sale = $state({} as ISale);

    const loadData = async () => {
        sale = await data.sale;
    }
</script>
{#await loadData()}
    <Loading></Loading>
{:then _}
    <form method="post" action="/l/dialogs/sale/{id}">
        test {sale.personName}
    </form>
{/await}
