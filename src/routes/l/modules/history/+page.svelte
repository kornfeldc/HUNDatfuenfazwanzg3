<script lang="ts">
    import type {IHistory} from "$lib/data/hfzApi";
    import History from "$lib/components/global/History.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";

    let {data}: { data: { initialHistory: Promise<Array<IHistory>>, limit: number } } = $props();

    let history = $state<Array<IHistory>>([]);
    let loadingMore = $state(false);
    let hasMore = $state(true);
    let sentinel = $state<HTMLDivElement>();

    const matchesSearch = (item: IHistory) => {
        const search = uiState.searchString.toLowerCase().trim();
        if (!search) return true;

        return [item.action, item.entityType, item.entityId, item.details, item.userEmail]
            .filter(Boolean)
            .some(value => value.toString().toLowerCase().includes(search));
    };

    const filteredHistory = $derived(history.filter(matchesSearch));

    const loadInitialHistory = async () => {
        history = await data.initialHistory;
        hasMore = history.length >= data.limit;
    };

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        loadingMore = true;

        try {
            const response = await fetch(`/l/modules/history/api?offset=${history.length}&limit=${data.limit}`);
            const result = await response.json();
            history = [...history, ...result.history];
            hasMore = result.hasMore;
        } finally {
            loadingMore = false;
        }
    };

    $effect(() => {
        if (!sentinel) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0]?.isIntersecting) {
                void loadMore();
            }
        }, {rootMargin: '600px'});

        observer.observe(sentinel);
        return () => observer.disconnect();
    });
</script>

{#await loadInitialHistory()}
    <Loading/>
{:then _}
    <div class="max-w-2xl m-auto h-full px-1">
        <Card className="mb-4 text-center sticky top-0 z-10 shadow-md">
            <CardTitleBig>Historie</CardTitleBig>
            <div class="text-sm text-muted-foreground mt-1">
                Alle Änderungen chronologisch zusammengeführt
            </div>
        </Card>

        <History history={filteredHistory}/>

        <div bind:this={sentinel} class="h-16 flex items-center justify-center">
            {#if loadingMore}
                <Loading/>
            {/if}
        </div>
    </div>
{/await}
