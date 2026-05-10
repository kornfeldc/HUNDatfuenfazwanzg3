<script lang="ts">
    import {moment} from "$lib/util";
    import History from "$lib/components/global/History.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import {ChevronLeft, ChevronRight} from "@lucide/svelte";
    import { breadcrumbStore } from '$lib/stores/breadcrumbStore.svelte';

    let {data} = $props();

    let history = $state([]);
    let paging = $state({prev: null, next: null});
    let date = $derived(data.date);

    const loadHistory = async () => {
        history = await data.history;
        paging = await data.paging;
        breadcrumbStore.detailLabel = moment(date).format('DD.MM.YYYY');
    }
</script>

{#await loadHistory()}
    <Loading></Loading>
{:then _}
    <div class="max-w-xl m-auto h-full overflow-y-auto pb-24 px-1">
        <Card className="mb-4 text-center sticky top-0 z-10 shadow-md">
            <CardTitleBig>{moment(date).format("dddd, DD.MM.YYYY")}</CardTitleBig>
        </Card>

        <History {history}></History>
    </div>

    <BackButton></BackButton>
    {#if paging.prev}
        <PlaceAtBottom>
            <a href={`/l/dialogs/history?date=${paging.prev}`} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-primary hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                <ChevronLeft class="w-6 h-6"/>
            </a>
        </PlaceAtBottom>
    {/if}
    {#if paging.next}
        <PlaceAtBottom>
            <a href={`/l/dialogs/history?date=${paging.next}`} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-primary hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                <ChevronRight class="w-6 h-6"/>
            </a>
        </PlaceAtBottom>
    {/if}
{/await}
