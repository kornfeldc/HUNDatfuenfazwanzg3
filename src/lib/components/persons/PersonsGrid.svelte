<script lang="ts">
    import type {IPerson} from "$lib/data/hfzApi";
    import PersonsGridEntry from "./PersonsGridEntry.svelte";
    import Grid from "$lib/components/global/Grid.svelte";

    interface IProps {
        persons: Array<IPerson>;
        href?: string;
    }

    let {persons, href = ""}: IProps = $props();
</script>
<Grid>
    {#each persons as person}
        <PersonsGridEntry {person} {href}/>
    {/each}
</Grid>
