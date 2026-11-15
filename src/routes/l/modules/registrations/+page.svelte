<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import Grid from "$lib/components/global/Grid.svelte";
    import PersonsTabs from "$lib/components/persons/PersonsTabs.svelte";
    import RegistrationCard from "$lib/components/persons/RegistrationCard.svelte";
    import type {IPerson} from "$lib/data/hfzApi";
    import {uiState} from "$lib/stores/uiState.svelte";

    let {data}: { data: any } = $props();

    // Already sorted newest first by the API
    const filter = (registrations: Array<IPerson>) => {
        const search = uiState.searchString.toLowerCase();
        return registrations.filter((p: IPerson) =>
            [p.firstName, p.lastName, p.dogNames, p.email, p.phone, p.city]
                .some(value => value?.toLowerCase().includes(search))
        );
    }
</script>
<PersonsTabs/>
{#await data.registrations}
    <Loading></Loading>
{:then registrations}
    {@const shown = filter(registrations)}
    {#if shown.length}
        <Grid>
            {#each shown as person (person.id)}
                <RegistrationCard {person}/>
            {/each}
        </Grid>
    {:else}
        <p class="text-center text-muted-foreground py-8">
            {registrations.length ? "Keine Anmeldung passt zur Suche." : "Noch keine Online-Anmeldungen."}
        </p>
    {/if}
{/await}
