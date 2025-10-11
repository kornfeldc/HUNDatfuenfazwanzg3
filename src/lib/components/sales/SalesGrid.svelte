<script lang="ts">
    import type {ISale} from "$lib/data/hfzApi";
    import SalesGridEntry from "./SalesGridEntry.svelte";
    import Grid from "$lib/components/global/Grid.svelte";

    interface IProps {
        sales: Array<ISale>;
    }

    let {sales}: IProps = $props();
</script>


<Grid minColumnWidth="28em">
    {#each sales as sale}
        <SalesGridEntry {sale}/>
    {/each}
</Grid>
