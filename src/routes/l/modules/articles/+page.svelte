<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import ArticlesGrid from "$lib/components/articles/ArticlesGrid.svelte";
    import AddButton from "$lib/components/global/AddButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SearchButton from "$lib/components/global/SearchButton.svelte";
    import type {IArticle} from "$lib/data/hfzApi";

    let {data}: { data: any } = $props();
    let searchString = $state("");
    const onSearch = (value: string) => {
        searchString = value;
    }

    const filter = (articles: Array<IArticle>) => {
        return articles.filter((a: IArticle) =>
            a.title?.toLowerCase().includes(searchString.toLowerCase())
        );
    }
</script>
{#await data.articles}
    <Loading></Loading>
{:then articles}
    <ArticlesGrid articles={filter(articles)}/>
{/await}

<NavigationActions>
    <SearchButton slot="persistent" {onSearch}></SearchButton>
    <AddButton slot="actions" href="/l/dialogs/article"></AddButton>
</NavigationActions>
