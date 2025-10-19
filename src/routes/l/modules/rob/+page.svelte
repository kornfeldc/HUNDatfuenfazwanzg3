<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import RobGrid from "$lib/components/rob/RobGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import SearchButton from "$lib/components/global/NavigationButtons/SearchButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import type {IRobCourse, IRobCoursePerson} from "$lib/data/hfzApi";
    import { page } from '$app/stores';

    import FilterBar from "$lib/components/global/FilterBar.svelte";
    let type = $derived($page.url.searchParams.get("type") ?? "current");

    import moment from "moment";
    import thenby from 'thenby';
    const { firstBy } = thenby;

    let {data}: { data: any } = $props();
    let searchString = $state("");
    const onSearch = (value: string) => {
        searchString = value;
    }
    
    const filter = (robCourses: Array<IRobCourse>) => {
       return robCourses.filter((r:IRobCourse) =>
           (r.persons?.find((p:IRobCoursePerson)=> p?.personName.toLowerCase().includes(searchString.toLowerCase())) ||
           r.persons?.find((p:IRobCoursePerson)=> p?.dogName.toLowerCase().includes(searchString.toLowerCase()))) && 
           isTypeMatching(r)
       ).sort(firstBy("date", { direction: "desc" }));
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
    <SearchButton slot="persistent" {onSearch}></SearchButton>
    <AddButton slot="actions" href="/l/dialogs/rob"></AddButton>
</NavigationActions>
