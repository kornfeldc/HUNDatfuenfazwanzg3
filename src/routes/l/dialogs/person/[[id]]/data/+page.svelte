<script lang="ts">
    import {page} from '$app/stores';
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import {ArrowUpDown, Diff, Trash} from "@lucide/svelte";
    import type {IPerson} from "$lib/data/hfzApi";
    import {Label} from "$lib/components/shadcn/ui/label";

    // noinspection ES6UnusedImports
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";
    import {Button} from "$lib/components/shadcn/ui/button";
    import {Checkbox} from "$lib/components/shadcn/ui/checkbox";
    // noinspection ES6UnusedImports
    import * as Select from "$lib/components/shadcn/ui/select/index.js";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import {Util} from "$lib/util";
    import {uiState} from "$lib/stores/uiState.svelte";
    import {enhance} from '$app/forms';
    import {goto} from '$app/navigation';
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import { breadcrumbStore } from '$lib/stores/breadcrumbStore.svelte';

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let person = $state({} as IPerson);
    let formPerson = $state({} as IPerson);
    let isConnected = $state(false);
    let submitting = $state(false);
    let errorMessage = $state("");

    let isSubPerson = $derived(formPerson.mainPersonId && formPerson.mainPersonId !== formPerson.id);

    let redirectValue = $state(uiState.getLastRouteSmart());

    const dogSexLabels: Record<string, string> = {"": "–", male: "Rüde", female: "Hündin"};

    const loadPerson = async () => {
        person = await data.person;
        formPerson.id = person?.id;
        formPerson.lastName = person?.lastName ?? "";
        formPerson.firstName = person?.firstName ?? "";
        formPerson.dogNames = person?.dogNames ?? "";
        formPerson.phone = person?.phone ?? "";
        formPerson.email = person?.email ?? "";
        formPerson.isMember = person?.isMember ?? false;
        formPerson.isOnMailingList = person?.isOnMailingList ?? false;
        formPerson.isActive = person?.isActive ?? true;
        formPerson.info = person?.info ?? "";
        formPerson.birthDate = person?.birthDate ?? "";
        formPerson.street = person?.street ?? "";
        formPerson.postalCode = person?.postalCode ?? "";
        formPerson.city = person?.city ?? "";
        formPerson.dogBreed = person?.dogBreed ?? "";
        formPerson.dogSex = person?.dogSex ?? "" as any;
        formPerson.dogBirthDate = person?.dogBirthDate ?? "";
        formPerson.dogChipNumber = person?.dogChipNumber ?? "";
        formPerson.dogInsuranceNumber = person?.dogInsuranceNumber ?? "";
        formPerson.photoConsent = person?.photoConsent ?? false;
        formPerson.referralSource = person?.referralSource ?? "";
        breadcrumbStore.detailLabel = formPerson.id
            ? (formPerson.firstName + ' ' + formPerson.lastName).trim()
            : 'Neue Person';
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
    <form id="personForm" method="post" action={id ? `/l/dialogs/person/${id}/data` : `/l/dialogs/person/data`} use:enhance={({ formData }) => {
        submitting = true;
        errorMessage = "";
        const isDelete = !!formData.get('deleteAction');
        return async ({ update, result }) => {
            if (isDelete && result.type === 'redirect') {
                submitting = false;
                await goto(result.location);
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


                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="dogBreed-{id}">Rasse</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="dogBreed" id="dogBreed-{id}"
                                          bind:value={formPerson.dogBreed}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="dogSex-{id}">Geschlecht</Label>
                    <Select.Root type="single" name="dogSex" bind:value={formPerson.dogSex as string}>
                        <Select.Trigger id="dogSex-{id}" class="w-full">{dogSexLabels[formPerson.dogSex ?? ""]}</Select.Trigger>
                        <Select.Content>
                            {#each Object.keys(dogSexLabels) as sex}
                                <Select.Item value={sex}>{dogSexLabels[sex]}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="dogBirthDate-{id}">Wurfdatum</Label>
                    <InputGroup.Root>
                        <InputGroup.Input type="date" name="dogBirthDate" id="dogBirthDate-{id}"
                                          bind:value={formPerson.dogBirthDate}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="dogChipNumber-{id}">Chipnummer</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="dogChipNumber" id="dogChipNumber-{id}"
                                          bind:value={formPerson.dogChipNumber}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="dogInsuranceNumber-{id}">Versicherungsnummer</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="dogInsuranceNumber" id="dogInsuranceNumber-{id}"
                                          bind:value={formPerson.dogInsuranceNumber}></InputGroup.Input>
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

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="birthDate-{id}">Geburtsdatum</Label>
                    <InputGroup.Root>
                        <InputGroup.Input type="date" name="birthDate" id="birthDate-{id}"
                                          bind:value={formPerson.birthDate}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="street-{id}">Adresse</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="street" id="street-{id}"
                                          bind:value={formPerson.street}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-4 flex flex-col gap-2">
                    <Label for="postalCode-{id}">PLZ</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="postalCode" id="postalCode-{id}"
                                          bind:value={formPerson.postalCode}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-8 flex flex-col gap-2">
                    <Label for="city-{id}">Ort</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="city" id="city-{id}"
                                          bind:value={formPerson.city}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="mailingList-{id}" class="whitespace-nowrap">Auf Mailing-Liste</Label>
                    <input type="hidden" name="isOnMailingList" value={formPerson.isOnMailingList ? 'on' : ''}/>
                    <Checkbox id="mailingList-{id}" bind:checked={formPerson.isOnMailingList}/>
                    {#if formPerson.isOnMailingList && !formPerson.email?.includes("@")}
                        <span class="text-xs text-muted-foreground">Ohne gültige Email wird die Person nicht exportiert.</span>
                    {/if}
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

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="photoConsent-{id}" class="whitespace-nowrap">Fotos/Videos dürfen veröffentlicht werden</Label>
                    <input type="hidden" name="photoConsent" value={formPerson.photoConsent ? 'on' : ''}/>
                    <Checkbox id="photoConsent-{id}" bind:checked={formPerson.photoConsent}/>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="referralSource-{id}">Aufmerksam geworden durch</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="referralSource" id="referralSource-{id}"
                                          bind:value={formPerson.referralSource}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="info-{id}">Sonstige Infos</Label>
                    <InputGroup.Root>
                        <InputGroup.Textarea name="info" id="info-{id}"
                                             bind:value={formPerson.info}></InputGroup.Textarea>
                    </InputGroup.Root>
                </div>

            </div>
            {#if person?.registeredAt}
                <p class="pt-4 text-xs text-muted-foreground">Online angemeldet am {Util.formatDate(new Date(person.registeredAt))}</p>
            {/if}

        </Card>

        {#if id}
            <PlaceAtBottom>
                <button type="submit" form="personForm" name="deleteAction" value="true" class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-destructive cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <Trash class="w-7 h-7"/>
                </button>
            </PlaceAtBottom>
        {/if}
        {#if !isSubPerson}
            <PlaceAtBottom>
                <button type="submit" form="personForm" onclick={() => redirectValue = `/l/dialogs/person/{id}/actions`} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <Diff class="w-7 h-7"/>
                </button>
            </PlaceAtBottom>
        {/if}
        <SaveButton form="personForm"></SaveButton>
    </form>
{/await}

{#if submitting}
    <Loading/>
{/if}

