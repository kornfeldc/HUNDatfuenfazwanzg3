<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import HomepageTabs from "$lib/components/homepage/HomepageTabs.svelte";
    import {Label} from "$lib/components/shadcn/ui/label";
    import {Checkbox} from "$lib/components/shadcn/ui/checkbox";
    import {Button} from "$lib/components/shadcn/ui/button";
    // noinspection ES6UnusedImports
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";
    import CheckIcon from "@lucide/svelte/icons/check";
    import {Copy, Download} from "@lucide/svelte";
    import {buildMailingList, toCsv, type IMailingListEntry, type IMailingListPerson} from "$lib/mailingList";
    import {moment, Util} from "$lib/util";

    let {data}: { data: any } = $props();

    let members = $state(false);
    let courses = $state(false);
    let courseDays = $state(90);
    let toast = $state("");

    const today = moment().format("YYYY-MM-DD");

    const build = (persons: Array<IMailingListPerson>) => buildMailingList(persons, {
        members,
        courseDays: courses && courseDays > 0 ? courseDays : null
    }, today);

    const showToast = (text: string) => {
        toast = text;
        setTimeout(() => toast = "", 2000);
    }

    const copyEmails = async (entries: Array<IMailingListEntry>) => {
        await navigator.clipboard.writeText(entries.map(e => e.email).join(", "));
        showToast(`${entries.length} Adressen kopiert`);
    }

    const downloadCsv = (entries: Array<IMailingListEntry>) => {
        const url = URL.createObjectURL(new Blob([toCsv(entries)], {type: "text/csv;charset=utf-8"}));
        const link = document.createElement("a");
        link.href = url;
        link.download = `mailing-liste-${today}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }
</script>
<HomepageTabs/>
{#await data.persons}
    <Loading></Loading>
{:then persons}
    {@const entries = build(persons)}
    <Card className="max-w-xl m-auto mb-2">
        <div class="flex flex-col gap-4">
            <p class="text-sm text-muted-foreground">
                Exportiert alle Personen mit Email und „Auf Mailing-Liste“.
                Mit Filtern nur jene, die mindestens einen Filter erfüllen.
            </p>

            <div class="flex items-center gap-2">
                <Checkbox id="filter-members" bind:checked={members}/>
                <Label for="filter-members">Mitglieder</Label>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <Checkbox id="filter-courses" bind:checked={courses}/>
                <Label for="filter-courses">Aktive Kursteilnehmer</Label>
                <span class="text-sm text-muted-foreground">in den letzten</span>
                <InputGroup.Root class="w-20">
                    <InputGroup.Input type="number" min="1" id="filter-days" aria-label="Tage"
                                      disabled={!courses} bind:value={courseDays}></InputGroup.Input>
                </InputGroup.Root>
                <span class="text-sm text-muted-foreground">Tagen</span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <Button variant="outline" disabled={!entries.length} onclick={() => copyEmails(entries)}>
                    <Copy class="h-4 w-4"/> Emails kopieren
                </Button>
                <Button variant="outline" disabled={!entries.length} onclick={() => downloadCsv(entries)}>
                    <Download class="h-4 w-4"/> CSV
                </Button>
                <span class="text-sm text-muted-foreground ml-auto">{entries.length} Adressen</span>
            </div>
        </div>
    </Card>

    <Card className="max-w-xl m-auto mb-24">
        {#each entries as entry (entry.email)}
            <div class="flex items-center gap-2 py-2 border-b border-border/50 last:border-b-0">
                <div class="flex flex-col min-w-0 grow">
                    <span class="truncate">{entry.names.join(", ")}</span>
                    <span class="truncate text-sm text-muted-foreground">{entry.email}</span>
                </div>
                <div class="flex flex-col items-end text-xs text-muted-foreground shrink-0">
                    {#if entry.isMember}<span>Mitglied</span>{/if}
                    {#if entry.lastCourseDate}<span>Kurs {Util.formatDate(moment(entry.lastCourseDate).toDate())}</span>{/if}
                </div>
            </div>
        {:else}
            <div class="text-center text-sm text-muted-foreground">Keine Personen gefunden</div>
        {/each}
    </Card>

    {#if toast}
        <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
            <CheckIcon size={16}/>
            <span>{toast}</span>
        </div>
    {/if}
{/await}
