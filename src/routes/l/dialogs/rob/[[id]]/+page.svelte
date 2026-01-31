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
    import { goto } from '$app/navigation';
    import {moment} from "$lib/util";
    import CopyIcon from "@lucide/svelte/icons/copy";
    import CheckIcon from "@lucide/svelte/icons/check";
    import TrashIcon from "@lucide/svelte/icons/trash-2";
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    import { Button } from "$lib/components/shadcn/ui/button";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let formRob = $state({
        id: 0,
        date: new Date(),
        maxPersons: 6,
        link: "",
        persons: [] as any[]
    } as IRobCourse);
    let submitting = $state(false);
    let errorMessage = $state("");
    let origin = $state("");
    let dateStr = $state("");
    let showToast = $state(false);

    const hasPersons = $derived(formRob.persons?.length > 0);

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
            formRob.persons = rob.persons ?? (rob as any).rob_course_person ?? [];
        } else {
            formRob.id = 0;
            formRob.date = moment().startOf("week").add(1, "week").toDate();
            formRob.maxPersons = 6;
            formRob.link = Math.random().toString(36).substring(2, 8);
            formRob.persons = [];
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
    <div>
        <form method="post" action="?/save" use:enhance={() => {
            submitting = true;
            errorMessage = "";
            return async ({ update, result }) => {
                if (result.type === 'failure') {
                    errorMessage = result.data?.error || "Ein Fehler ist aufgetreten";
                    submitting = false;
                    return;
                }
                await update();
                submitting = false;
            };
        }} id="robForm">
            <input type="hidden" name="redirectTo" value={uiState.getLastRouteSmart()}>
            {#if errorMessage}
                <Card className="max-w-xl m-auto mb-2 bg-destructive/10 text-destructive border-destructive/20">
                    <div class="p-2 text-center font-medium">{errorMessage}</div>
                </Card>
            {/if}
            <Card className="max-w-xl m-auto">
                <CardTitleBig className="hidden sm:block pb-2">{formRob.id ? "ROB Kurs bearbeiten" : "Neuer ROB Kurs"}</CardTitleBig>
                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 flex flex-col gap-2">
                        <Label for="date-{id}">Datum</Label>
                        <InputGroup.Root>
                            <InputGroup.Input type="date" name="date" id="date-{id}"
                                              readonly={hasPersons}
                                              bind:value={dateStr}></InputGroup.Input>
                        </InputGroup.Root>
                    </div>

                    <div class="col-span-12 flex flex-col gap-2">
                        <Label for="maxPersons-{id}">Max. Personen</Label>
                        <InputGroup.Root>
                            <InputGroup.Input type="number" name="maxPersons" id="maxPersons-{id}"
                                              readonly={hasPersons}
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
        </form>

        {#if hasPersons}
            <Card className="max-w-xl m-auto mt-6">
                <CardTitleBig className="pb-4">Angemeldete Personen</CardTitleBig>
                <div class="flex flex-col gap-4">
                    {#each formRob.persons as person}
                        <div class="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                            <div class="flex flex-col gap-1">
                                <div class="text-lg">
                                    {person.personName} mit <b class="font-bold">{person.dogName}</b>
                                </div>
                                <div class="text-sm text-muted-foreground">
                                    {moment(person.timestamp).format('DD.MM.YYYY HH:mm')}
                                </div>
                            </div>
                            <form method="post" action="?/deletePerson" use:enhance={() => {
                                submitting = true;
                                errorMessage = "";
                                return async ({ result }) => {
                                    if (result.type === 'failure') {
                                        errorMessage = result.data?.error || "Ein Fehler ist aufgetreten";
                                        submitting = false;
                                        return;
                                    }
                                    if (result.type === 'success') {
                                        await invalidateAll();
                                        await loadRob();
                                    }
                                    submitting = false;
                                };
                            }}>
                                <input type="hidden" name="personId" value={person.id} />
                                <Button type="submit" variant="ghost" size="icon" class="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <TrashIcon size={20} />
                                </Button>
                            </form>
                        </div>
                    {/each}
                </div>
            </Card>
        {/if}

        {#if showToast}
            <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
                <CheckIcon size={16} />
                <span>Link wurde kopiert</span>
            </div>
        {/if}

        <PlaceAtBottom>
            <BackButton></BackButton>
            {#if id}
                <form method="post" action="?/delete" use:enhance={() => {
                    submitting = true;
                    errorMessage = "";
                    return async ({ result }) => {
                        if (result.type === 'redirect') {
                            submitting = false;
                            await goto(result.location);
                            return;
                        }
                        if (result.type === 'failure') {
                            errorMessage = result.data?.error || "Ein Fehler ist aufgetreten";
                            submitting = false;
                            return;
                        }
                        submitting = false;
                    };
                }}>
                    <button type="submit">
                        <GlassCircleLink className={"bg-destructive! text-destructive-foreground!"}>
                            <TrashIcon/>
                        </GlassCircleLink>
                    </button>
                </form>
            {/if}
        </PlaceAtBottom>
        <NavigationActions>
            <div slot="actions">
                {#if !hasPersons}
                    <button type="submit" form="robForm">
                        <SaveButton></SaveButton>
                    </button>
                {/if}
            </div>
        </NavigationActions>
    </div>
{:catch error}
    <div class="text-destructive text-center p-4">
        Error loading course: {error.message}
    </div>
{/await}

{#if submitting}
    <Loading/>
{/if}