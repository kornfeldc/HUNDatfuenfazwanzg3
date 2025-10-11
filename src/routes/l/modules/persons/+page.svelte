<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import PersonsGrid from "$lib/components/persons/PersonsGrid.svelte";

    let {data}: { data: any } = $props();
</script>
{#await data.persons}
    <Loading></Loading>
{:then persons}
    <PersonsGrid {persons} />
{/await}
