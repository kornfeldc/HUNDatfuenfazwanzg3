<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import ArticlesGrid from "$lib/components/articles/ArticlesGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {ArticleTypes, type IArticle} from "$lib/data/hfzApi";
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import { uiState } from "$lib/stores/uiState.svelte";

    import thenby from 'thenby';
    const {firstBy} = thenby;

    let {data}: { data: any } = $props();
    import { page } from '$app/stores';
    let type = $derived($page.url.searchParams.get("type") ?? "favorite");
    
    const filter = (articles: Array<IArticle>) => {
        return articles.filter((a: IArticle) =>
            a.title?.toLowerCase().includes(uiState.searchString.toLowerCase()) &&
            (
                !type || 
                (type === "favorite" && a.isFavorite && a.isActive) ||
                (type === "inactive" && !a.isActive) ||
                a.type === type
            )
        ).sort(firstBy("title"));
    }
    
    const filterItems = [
        {id: "favorite", label: "Favoriten"},
        ...Object.keys(ArticleTypes).map((t) => ({id: t, label: ArticleTypes[t]})),
        {id: "inactive", label: "Inaktiv"}
    ];
</script>
{#await data.articles}
    <Loading></Loading>
{:then articles}
    <FilterBar className="px-3 mb-2" items={filterItems} selected={type} parameterName="type"></FilterBar>
    <ArticlesGrid articles={filter(articles)}/>
{/await}

<NavigationActions>
    <AddButton slot="actions" href="/l/dialogs/article"></AddButton>
</NavigationActions>
