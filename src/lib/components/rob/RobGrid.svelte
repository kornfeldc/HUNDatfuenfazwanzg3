<script lang="ts">
    import type {IPerson, IRobCourse} from "$lib/data/hfzApi";
    import RobGridEntry from "./RobGridEntry.svelte";
    import Grid from "$lib/components/global/Grid.svelte";

    interface IProps {
        robCourses: Array<IRobCourse>;
    }

    let {robCourses}: IProps = $props();
</script>
<Grid>
    {#each robCourses as robCourse}
        <RobGridEntry {robCourse}/>
    {/each}
</Grid>
