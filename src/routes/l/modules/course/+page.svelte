<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import SearchButton from "$lib/components/global/NavigationButtons/SearchButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {type IPerson} from "$lib/data/hfzApi";

    import thenby from 'thenby';
    import {page} from '$app/stores';
    import CourseGrid from "$lib/components/course/CourseGrid.svelte";

    const {firstBy} = thenby;

    let {data}: { data: any } = $props();
    let searchString = $state("");

    let type = $derived($page.url.searchParams.get("type") ?? "active");

    const onSearch = (value: string) => {
        searchString = value;
    }

    const filter = (persons: Array<IPerson>) => {
        return persons.filter((p: IPerson) =>
            (p.lastName?.toLowerCase().includes(searchString.toLowerCase()) ||
                p.firstName?.toLowerCase().includes(searchString.toLowerCase()) ||
                p.dogNames?.toLowerCase().includes(searchString.toLowerCase()))
        ).sort(
            firstBy((person: IPerson) => person.lastName || '\uffff', {ignoreCase: true})
                .thenBy((person: IPerson) => person.firstName || '\uffff', {ignoreCase: true})
        );
    }
</script>
{#await data.persons}
    <Loading></Loading>
{:then persons}
    <CourseGrid persons={filter(persons)}/>
{/await}

<NavigationActions>
    <SearchButton {onSearch} slot="persistent"></SearchButton>
</NavigationActions>
