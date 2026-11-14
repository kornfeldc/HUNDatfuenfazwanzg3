<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import NewsGrid from "$lib/components/news/NewsGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import type {INews} from "$lib/data/hfzApi";
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import HomepageTabs from "$lib/components/homepage/HomepageTabs.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import {page} from '$app/stores';

    let {data}: { data: any } = $props();
    let type = $derived($page.url.searchParams.get("type") ?? "all");

    // Already sorted newest first by the API
    const filter = (news: Array<INews>) => {
        const search = uiState.searchString.toLowerCase();
        return news.filter((n: INews) =>
            (n.title?.toLowerCase().includes(search) || n.content?.toLowerCase().includes(search)) &&
            (
                type === "all" ||
                (type === "published" && n.isPublished) ||
                (type === "draft" && !n.isPublished)
            )
        );
    }

    const filterItems = [
        {id: "all", label: "Alle"},
        {id: "published", label: "Veröffentlicht"},
        {id: "draft", label: "Entwürfe"},
    ];
</script>
<HomepageTabs/>
{#await data.news}
    <Loading></Loading>
{:then news}
    <FilterBar className="px-3 mb-2" items={filterItems} selected={type} parameterName="type"></FilterBar>
    <NewsGrid news={filter(news)}/>
{/await}

<AddButton href="/l/dialogs/news"></AddButton>
