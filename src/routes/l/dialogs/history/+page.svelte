<script lang="ts">
    import {moment} from "$lib/util";
    import History from "$lib/components/global/History.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {ChevronLeft, ChevronRight} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";

    let {data} = $props();

    let history = $state([]);
    let paging = $state({prev: null, next: null});
    let date = $derived(data.date);

    const loadHistory = async () => {
        history = await data.history;
        paging = await data.paging;
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

    <PlaceAtBottom>
        <BackButton></BackButton>
    </PlaceAtBottom>

    <NavigationActions>
        <div slot="actions" class="flex gap-2">
            {#if paging.prev}
                <GlassCircleLink href={`/l/dialogs/history?date=${paging.prev}`} className="bg-primary/90! border-0 shadow-md">
                    <ChevronLeft class="text-primary-foreground"/>
                </GlassCircleLink>
            {/if}
            {#if paging.next}
                <GlassCircleLink href={`/l/dialogs/history?date=${paging.next}`} className="bg-primary/90! border-0 shadow-md">
                    <ChevronRight class="text-primary-foreground"/>
                </GlassCircleLink>
            {/if}
        </div>
    </NavigationActions>
{/await}
