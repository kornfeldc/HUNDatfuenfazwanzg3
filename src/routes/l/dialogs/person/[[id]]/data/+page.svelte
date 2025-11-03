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
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import {Util} from "$lib/util";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let formPerson = $state({} as IPerson);
    let isConnected = $state(false);
    
    const loadPerson = async () => {
        const person = await data.person;
        formPerson.id = person?.id;
        formPerson.lastName = person?.lastName ?? "";
        formPerson.firstName = person?.firstName ?? "";
        formPerson.dogNames = person?.dogNames ?? "";
        formPerson.phone = person?.phone ?? "";
        formPerson.email = person?.email ?? "";
        formPerson.isMember = person?.isMember ?? false;
        formPerson.isActive = person?.isActive ?? true;
        formPerson.personGroup = person?.personGroup ?? "";
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
    <form method="post" action={id ? `/l/dialogs/person/${id}/data` : `/l/dialogs/person/data`}>
        <input type="hidden" name="redirectTo" value={uiState.getLastRouteSmart()}>
        <Card className="max-w-xl m-auto">
            <CardTitleBig className="hidden sm:block pb-2">{formPerson.id ? (formPerson.lastName + " " + formPerson.firstName) : "Neue Person"}</CardTitleBig>
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
                    <Checkbox id="member-{id}" bind:checked={formPerson.isMember} />
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="active-{id}" class="whitespace-nowrap">Ist Aktiv</Label>
                    <input type="hidden" name="isActive" value={formPerson.isActive ? 'on' : ''}/>
                    <Checkbox id="active-{id}" bind:checked={formPerson.isActive} />
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="connected-{id}" class="whitespace-nowrap">Zusammenhängend</Label>
                    <input type="hidden" name="isConnected" value={isConnected ? 'on' : ''}/>
                    <Checkbox id="connected-{id}" bind:checked={isConnected} />
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

            </div>

        </Card>

        <NavigationActions>
            <div class="flex gap-2" slot="actions">
                <GlassCircleLink
                        className={" bg-primary/90! border-0 drop-shadow-primary/90 drop-shadow-xl "}
                        href={`/l/dialogs/person/${id}/actions`}>
                    <Diff class="text-primary-foreground"/>
                </GlassCircleLink>
                <button type="submit">
                    <SaveButton></SaveButton>
                </button>
            </div>
        </NavigationActions>
    </form>
{/await}

