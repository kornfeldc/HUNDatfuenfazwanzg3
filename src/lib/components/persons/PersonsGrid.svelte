<script lang="ts">
    import type {IPerson} from "$lib/data/hfzApi";
    import PersonsGridEntry from "./PersonsGridEntry.svelte";
    interface IProps {
        persons: Array<IPerson>;
    }

    let {persons}: IProps = $props();
</script>

<div class="grid grid-cols-2 gap-4 m-4">
{#each persons as person}
    <PersonsGridEntry {person}/>
{/each}
</div>
