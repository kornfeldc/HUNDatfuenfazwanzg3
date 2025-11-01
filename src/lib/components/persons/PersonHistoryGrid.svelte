<script lang="ts">
    import type {IMergedPersonHistory} from "$lib/data/hfzApi";
    import Grid from "$lib/components/global/Grid.svelte";
    import PersonHistoryGridEntry from "$lib/components/persons/PersonHistoryGridEntry.svelte";

    interface IProps {
        history: Array<IMergedPersonHistory>;
        type: string;
    }

    let {history,type}: IProps = $props();
</script>
<Grid>
    {#each history as historyEntry}
        <PersonHistoryGridEntry {historyEntry} {type}/>
    {/each}
</Grid>
