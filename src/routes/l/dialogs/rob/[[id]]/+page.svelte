<script lang="ts">
    import {page} from '$app/stores';
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    import {Label} from "$lib/components/shadcn/ui/label";
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import type {IRobCourse} from "$lib/data/hfzApi";
    import {uiState} from "$lib/stores/uiState.svelte";
    import { enhance } from '$app/forms';
    import {moment} from "$lib/util";
    import CopyIcon from "@lucide/svelte/icons/copy";
    import CheckIcon from "@lucide/svelte/icons/check";
    import { onMount } from 'svelte';

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let formRob = $state({} as IRobCourse);
    let submitting = $state(false);
    let origin = $state("");
    let dateStr = $state("");
    let showToast = $state(false);

    onMount(() => {
        origin = window.location.origin;
    });

    const loadRob = async () => {
        const rob = await data.robCourse;
        if (rob) {
            formRob.id = rob.id;
            formRob.date = rob.date;
            formRob.maxPersons = rob.maxPersons;
            formRob.link = rob.link;
        } else {
            formRob.date = new Date();
            formRob.maxPersons = 10;
            formRob.link = Math.random().toString(36).substring(2, 8);
        }
        dateStr = moment(formRob.date).format('YYYY-MM-DD');
    }

    const copyLink = () => {
        const fullLink = `${origin}/rob/${formRob.link}`;
        navigator.clipboard.writeText(fullLink);
        showToast = true;
        setTimeout(() => showToast = false, 2000);
    }
</script>

{#await loadRob()}
    <Loading></Loading>
{:then _}
    <form method="post" action={id ? `/l/dialogs/rob/${id}` : `/l/dialogs/rob`} use:enhance={() => {
        submitting = true;
        return async ({ update }) => {
            await update();
            submitting = false;
        };
    }}>
        <input type="hidden" name="redirectTo" value={uiState.getLastRouteSmart()}>
        <Card className="max-w-xl m-auto">
            <CardTitleBig className="hidden sm:block pb-2">{formRob.id ? "Rob Kurs bearbeiten" : "Neuer Rob Kurs"}</CardTitleBig>
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="date-{id}">Datum</Label>
                    <InputGroup.Root>
                        <InputGroup.Input type="date" name="date" id="date-{id}"
                                          bind:value={dateStr}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="maxPersons-{id}">Max. Personen</Label>
                    <InputGroup.Root>
                        <InputGroup.Input type="number" name="maxPersons" id="maxPersons-{id}"
                                          bind:value={formRob.maxPersons}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="link-{id}">Öffentlicher Link</Label>
                    <InputGroup.Root>
                        <InputGroup.Input readonly value={`${origin}/rob/${formRob.link}`}></InputGroup.Input>
                        <input type="hidden" name="link" value={formRob.link}/>
                        <InputGroup.Button onclick={copyLink} size="icon-sm">
                            {#if showToast}
                                <CheckIcon size={16} class="text-ok" />
                            {:else}
                                <CopyIcon size={16}/>
                            {/if}
                        </InputGroup.Button>
                    </InputGroup.Root>
                </div>
            </div>
        </Card>

        {#if showToast}
            <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
                <CheckIcon size={16} />
                <span>Link wurde kopiert</span>
            </div>
        {/if}

        <PlaceAtBottom>
            <BackButton></BackButton>
        </PlaceAtBottom>
        <NavigationActions>
            <button type="submit" slot="actions">
                <SaveButton></SaveButton>
            </button>
        </NavigationActions>
    </form>
{/await}

{#if submitting}
    <Loading/>
{/if}