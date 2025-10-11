<script lang="ts">
    import type {IArticle} from "$lib/data/hfzApi";
    import ArticlesGridEntry from "./ArticlesGridEntry.svelte";
    import Grid from "$lib/components/global/Grid.svelte";

    interface IProps {
        articles: Array<IArticle>;
    }

    let {articles}: IProps = $props();
</script>
<Grid>
    {#each articles as article}
        <ArticlesGridEntry {article}/>
    {/each}
</Grid>
