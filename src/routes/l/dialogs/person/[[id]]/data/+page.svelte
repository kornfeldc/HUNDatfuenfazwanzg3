<script lang="ts">
    import {page} from '$app/stores';
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import {ArrowUpDown, Diff} from "@lucide/svelte";
    import type {IPerson} from "$lib/data/hfzApi";
    import {Label} from "$lib/components/shadcn/ui/label";

    // noinspection ES6UnusedImports
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";
    import {Button} from "$lib/components/shadcn/ui/button";
    import {Checkbox} from "$lib/components/shadcn/ui/checkbox";
    import {Trash} from '@lucide/svelte';
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import {Util} from "$lib/util";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import {enhance} from '$app/forms';
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let person = $state({} as IPerson);
    let formPerson = $state({} as IPerson);
    let isConnected = $state(false);
    let submitting = $state(false);
    let errorMessage = $state("");

    let isSubPerson = $derived(formPerson.mainPersonId && formPerson.mainPersonId !== formPerson.id);

    let redirectValue = $state(uiState.getLastRouteSmart());

    const loadPerson = async () => {
        person = await data.person;
        formPerson.id = person?.id;
        formPerson.lastName = person?.lastName ?? "";
        formPerson.firstName = person?.firstName ?? "";
        formPerson.dogNames = person?.dogNames ?? "";
        formPerson.phone = person?.phone ?? "";
        formPerson.email = person?.email ?? "";
        formPerson.isMember = person?.isMember ?? false;
        formPerson.isActive = person?.isActive ?? true;
        formPerson.personGroup = person?.personGroup ?? "";
        formPerson.mainPersonId = person?.mainPersonId;
        formPerson.info = person?.info ?? "";
        isConnected = !!formPerson.personGroup;
    }

    const swapName = () => {
        const temp = formPerson.firstName;
        formPerson.firstName = formPerson.lastName;
        formPerson.lastName = temp;
    }
</script>

{#await loadPerson()}
    <Loading></Loading>
{:then _}
    <form method="post" action={id ? `/l/dialogs/person/${id}/data` : `/l/dialogs/person/data`} use:enhance={({ formData }) => {
        submitting = true;
        errorMessage = "";
        const isDelete = !!formData.get('deleteAction');
        return async ({ update, result }) => {
            if (isDelete && result.type === 'redirect') {
                submitting = false;
                return;
            }
            if (result.type === 'failure') {
                errorMessage = result.data?.error || "Ein Fehler ist aufgetreten";
                submitting = false;
                return;
            }
            await update();
            submitting = false;
        };
    }}>
        <input type="hidden" name="redirectTo" value={redirectValue}>
        {#if errorMessage}
            <Card className="max-w-xl m-auto mb-2 bg-destructive/10 text-destructive border-destructive/20">
                <div class="p-2 text-center font-medium">{errorMessage}</div>
            </Card>
        {/if}
        {#if formPerson.id}
            <Card className="max-w-xl m-auto mb-2">
                <PersonOverview person={person}></PersonOverview>
            </Card>
        {/if}
        <Card className="max-w-xl m-auto">
            {#if !formPerson.id}
                <CardTitleBig
                        className="hidden sm:block pb-2">{formPerson.id ? (formPerson.lastName + " " + formPerson.firstName) : "Neue Person"}</CardTitleBig>
            {/if}
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="firstName-{id}">Vorname</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="firstName" id="firstName-{id}"
                                          bind:value={formPerson.firstName}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-10 flex flex-col gap-2">
                    <Label for="lastName-{id}">Nachname</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="lastName" id="lastName-{id}"
                                          bind:value={formPerson.lastName}></InputGroup.Input>
                    </InputGroup.Root>
                </div>
                <div class="col-span-2 flex items-end justify-end">
                    <Button variant="outline" class="font-light text-muted-foreground" onclick={() => swapName() }>
                        <ArrowUpDown class="h-4 w-4"></ArrowUpDown>
                    </Button>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="dogNames-{id}">Hunde Namen</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="dogNames" id="dogNames-{id}"
                                          bind:value={formPerson.dogNames}></InputGroup.Input>
                    </InputGroup.Root>
                </div>


                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="phone-{id}">Telefon</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="phone" id="phone-{id}"
                                          bind:value={formPerson.phone}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="email-{id}">Email</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="email" id="email-{id}"
                                          bind:value={formPerson.email}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="member-{id}" class="whitespace-nowrap">Ist Mitglied</Label>
                    <input type="hidden" name="isMember" value={formPerson.isMember ? 'on' : ''}/>
                    <Checkbox id="member-{id}" bind:checked={formPerson.isMember}/>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="active-{id}" class="whitespace-nowrap">Ist Aktiv</Label>
                    <input type="hidden" name="isActive" value={formPerson.isActive ? 'on' : ''}/>
                    <Checkbox id="active-{id}" bind:checked={formPerson.isActive}/>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="connected-{id}" class="whitespace-nowrap">Zusammenhängend</Label>
                    <input type="hidden" name="isConnected" value={isConnected ? 'on' : ''}/>
                    <Checkbox id="connected-{id}" bind:checked={isConnected}/>
                </div>

                <div class={Util.mapClass("col-span-6 flex flex-col gap-2", isConnected, "", "hidden")}>
                    <Label for="personGroup-{id}" class="whitespace-nowrap">Personengruppe</Label>
                    <InputGroup.Root>
                        <InputGroup.Input
                                name="personGroup"
                                id="personGroup-{id}"
                                bind:value={formPerson.personGroup}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="info-{id}">Sonstige Infos</Label>
                    <InputGroup.Root>
                        <InputGroup.Textarea name="info" id="info-{id}"
                                             bind:value={formPerson.info}></InputGroup.Textarea>
                    </InputGroup.Root>
                </div>

                {#if isSubPerson}
                    <div class="col-span-12 flex flex-col gap-2">
                        <Label>Guthaben wird nur für die Hauptperson verwaltet</Label>
                        <Button href={`/l/dialogs/person/${formPerson.mainPersonId}/data`} class="w-min">Hauptperson
                            öffnen
                        </Button>
                    </div>
                {/if}

            </div>

        </Card>

        <PlaceAtBottom>
            <BackButton></BackButton>
            {#if id}
                <button type="submit" name="deleteAction" value="true">
                    <GlassCircleLink className={"bg-destructive! text-destructive-foreground!"}>
                        <Trash/>
                    </GlassCircleLink>
                </button>
            {/if}
        </PlaceAtBottom>

        <NavigationActions>
            <div class="flex gap-2" slot="actions">
                {#if !isSubPerson}
                    <button type="submit" onclick={() => redirectValue = `/l/dialogs/person/{id}/actions`}>
                        <GlassCircleLink
                                className={" bg-primary/90! border-0 shadow-md "}>
                            <Diff class="text-primary-foreground"/>
                        </GlassCircleLink>
                    </button>
                {/if}
                <button type="submit" onclick={() => redirectValue = uiState.getLastRouteSmart()}>
                    <SaveButton></SaveButton>
                </button>
            </div>
        </NavigationActions>
    </form>
{/await}

{#if submitting}
    <Loading/>
{/if}

