<script lang="ts">
    import type {IPerson} from "$lib/data/hfzApi";
    import Grid from "$lib/components/global/Grid.svelte";
    import CourseGridEntry from "$lib/components/course/CourseGridEntry.svelte";

    interface IProps {
        persons: Array<IPerson>;
        href?: string;
        group?: "active" | "today" | "inactive";
    }

    let {persons, href = "", group = "active"}: IProps = $props();
</script>
<Grid>
    {#each persons as person}
        <CourseGridEntry {person} {href} {group}/>
    {/each}
</Grid>
