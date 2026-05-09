<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import RobGrid from "$lib/components/rob/RobGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import type {IRobCourse, IRobCoursePerson} from "$lib/data/hfzApi";
    import { page } from '$app/stores';
    import { uiState } from "$lib/stores/uiState.svelte";

    import FilterBar from "$lib/components/global/FilterBar.svelte";
    let type = $derived($page.url.searchParams.get("type") ?? "all");

    import {moment} from "$lib/util";
    import thenby from 'thenby';
    const { firstBy } = thenby;

    let {data}: { data: any } = $props();
    const filter = (robCourses: Array<IRobCourse>) => {
       return robCourses.filter((r:IRobCourse) => {
           const matchesSearch = !uiState.searchString || 
               moment(r.date).format('DD.MM.YYYY').includes(uiState.searchString) ||
               r.persons?.some((p:IRobCoursePerson)=> 
                   p?.personName?.toLowerCase().includes(uiState.searchString.toLowerCase()) || 
                   p?.dogName?.toLowerCase().includes(uiState.searchString.toLowerCase())
               );
           return matchesSearch && isTypeMatching(r);
       }).sort(firstBy("date", { direction: "desc" }));
    }
    
    const isTypeMatching = (robCourse: IRobCourse) => 
        !type || type === "all" || 
        (type === "current" && moment(robCourse.date).isAfter(moment().add(-1, "days"), "day"));  

    const filterItems = [
        {id: "current", label: "Aktuelle"},
        {id: "all", label: "Alle"},
    ];
    
</script>
{#await data.robCourses}
    <Loading></Loading>
{:then robCourses}
    <FilterBar className="px-3" items={filterItems} selected={type} parameterName="type"></FilterBar>
    <RobGrid robCourses={filter(robCourses)}/>
{/await}

<NavigationActions>
    <AddButton slot="actions" href="/l/dialogs/rob"></AddButton>
</NavigationActions>
