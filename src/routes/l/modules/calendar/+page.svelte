<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonsGrid from "$lib/components/persons/PersonsGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import SearchButton from "$lib/components/global/NavigationButtons/SearchButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {ArticleTypes, type IPerson} from "$lib/data/hfzApi";
    let {data}: { data: any } = $props();
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";

    import {uiState} from "$lib/stores/uiState.svelte";
    import FullScreenCalendar, {type ICalendarItem} from "$lib/components/global/FullScreenCalendar.svelte";
    import {Calendar} from "bits-ui";
    
    let calendarItems = $derived.by(() => {
        return [];
    }) as ICalendarItem[];
</script>
{#await data.sales}
    <Loading></Loading>
{:then _}
    <FullScreenCalendar items={calendarItems}></FullScreenCalendar>
{/await}

<PlaceAtBottom>
    <BackButton></BackButton>
</PlaceAtBottom>
