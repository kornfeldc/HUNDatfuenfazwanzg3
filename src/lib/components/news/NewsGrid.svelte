<script lang="ts">
    import type {INews} from "$lib/data/hfzApi";
    import NewsGridEntry from "./NewsGridEntry.svelte";
    import Grid from "$lib/components/global/Grid.svelte";

    interface IProps {
        news: Array<INews>;
    }

    let {news}: IProps = $props();
</script>
<Grid>
    {#each news as entry (entry.id)}
        <NewsGridEntry {entry}/>
    {/each}
</Grid>
