<script lang="ts">
    import {page} from '$app/stores';
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import type {IPerson} from "$lib/data/hfzApi";

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let formPerson = $state({} as IPerson);

    $effect(() => {
        const person = data.person;
        formPerson.id = person?.id;
    });
</script>

{#await data.article}
    <Loading></Loading>
{:then _}
    <form method="post" action="/l/dialogs/person/{id}/data">
        <Card>
            xxx
        </Card>

        <NavigationActions>
            <button type="submit" slot="actions">
                <SaveButton></SaveButton>
            </button>
        </NavigationActions>
    </form>
{/await}

