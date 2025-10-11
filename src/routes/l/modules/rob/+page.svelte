<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import RobGrid from "$lib/components/rob/RobGrid.svelte";
    import AddButton from "$lib/components/global/AddButton.svelte";
    import SearchButton from "$lib/components/global/SearchButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import type {IRobCourse, IRobCoursePerson} from "$lib/data/hfzApi";

    import thenby from 'thenby';
    const { firstBy } = thenby;

    let {data}: { data: any } = $props();
    let searchString = $state("");
    const onSearch = (value: string) => {
        searchString = value;
    }
    
    const filter = (robCourses: Array<IRobCourse>) => {
       return robCourses.filter((r:IRobCourse) =>
           r.persons?.find((p:IRobCoursePerson)=> p?.personName.toLowerCase().includes(searchString.toLowerCase())) ||
           r.persons?.find((p:IRobCoursePerson)=> p?.dogName.toLowerCase().includes(searchString.toLowerCase()))
       ).sort(firstBy("date", { direction: "desc" }));
    }
    
</script>
{#await data.robCourses}
    <Loading></Loading>
{:then robCourses}
    <RobGrid robCourses={filter(robCourses)}/>
{/await}

<NavigationActions>
    <SearchButton slot="persistent" {onSearch}></SearchButton>
    <AddButton slot="actions" href="/l/dialogs/rob"></AddButton>
</NavigationActions>
