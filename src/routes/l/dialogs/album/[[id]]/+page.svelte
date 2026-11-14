<script lang="ts">
    import {page} from '$app/stores';
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    import {Label} from "$lib/components/shadcn/ui/label";
    // noinspection ES6UnusedImports
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";

    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import type {IAlbum} from "$lib/data/hfzApi";
    import type {IAlbumPreview} from "$lib/googlePhotos";
    import {Checkbox} from "$lib/components/shadcn/ui/checkbox";
    import {Trash, History, Download, Image} from '@lucide/svelte';
    import {uiState} from "$lib/stores/uiState.svelte";
    import {moment} from "$lib/util";
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { breadcrumbStore } from '$lib/stores/breadcrumbStore.svelte';

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let formAlbum = $state({} as IAlbum);
    let dateStr = $state("");
    let submitting = $state(false);
    let loadingPreview = $state(false);
    let errorMessage = $state("");

    const loadAlbum = async () => {
        const album = await data.album;
        formAlbum.id = album?.id;
        formAlbum.title = album?.title ?? "";
        formAlbum.link = album?.link ?? "";
        formAlbum.coverUrl = album?.coverUrl ?? "";
        formAlbum.dateText = album?.dateText ?? "";
        formAlbum.isPublished = album?.isPublished ?? true;
        dateStr = moment(album?.date ?? new Date()).format('YYYY-MM-DD');
        breadcrumbStore.detailLabel = formAlbum.title || 'Neues Album';
    }

    // Fills title, date and cover from the album's Google Photos share page.
    const loadPreview = async () => {
        if (!formAlbum.link?.trim()) return;
        loadingPreview = true;
        errorMessage = "";
        try {
            const res = await fetch(`/l/modules/albums/preview?link=${encodeURIComponent(formAlbum.link.trim())}`);
            if (!res.ok) {
                errorMessage = (await res.json().catch(() => null))?.message ?? "Das Album konnte nicht gelesen werden.";
                return;
            }
            const preview: IAlbumPreview = await res.json();
            formAlbum.title = preview.title;
            formAlbum.coverUrl = preview.coverUrl;
            if (preview.date) dateStr = preview.date;
        } finally {
            loadingPreview = false;
        }
    }

    // A new album is filled in as soon as its link is pasted.
    const onLinkChange = () => {
        if (!formAlbum.id && !formAlbum.title) loadPreview();
    }
</script>

{#await loadAlbum()}
    <Loading></Loading>
{:then _}
    <form id="albumForm" method="post" action={id ? `/l/dialogs/album/${id}` : `/l/dialogs/album`} use:enhance={({ formData }) => {
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
                errorMessage = (result.data?.error as string) || "Ein Fehler ist aufgetreten";
                submitting = false;
                return;
            }
            await update();
            submitting = false;
        };
    }}>
        <input type="hidden" name="redirectTo" value={uiState.getLastRouteSmart()}>
        {#if errorMessage}
            <Card className="max-w-xl m-auto mb-2 bg-destructive/10 text-destructive border-destructive/20">
                <div class="p-2 text-center font-medium">{errorMessage}</div>
            </Card>
        {/if}
        <Card className="max-w-xl m-auto">
            <CardTitleBig className="hidden sm:block pb-2">{formAlbum.id ? formAlbum.title : "Neues Album"}</CardTitleBig>
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="link-{id}">Google Fotos Link</Label>
                    <InputGroup.Root>
                        <InputGroup.Input type="url" name="link" id="link-{id}" required
                                          placeholder="https://photos.app.goo.gl/…"
                                          bind:value={formAlbum.link} onchange={onLinkChange}></InputGroup.Input>
                        <InputGroup.Button onclick={loadPreview} disabled={loadingPreview} size="sm">
                            <Download size={16}/>
                            Laden
                        </InputGroup.Button>
                    </InputGroup.Root>
                    <p class="text-muted-foreground text-sm">
                        In Google Fotos beim Album auf „Teilen“ → „Link erstellen“. „Laden“ übernimmt Titel, Datum und
                        Vorschaubild aus dem Album.
                    </p>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="title-{id}">Titel</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="title" id="title-{id}" required
                                          bind:value={formAlbum.title}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="date-{id}">Datum</Label>
                    <InputGroup.Root>
                        <InputGroup.Input type="date" name="date" id="date-{id}" required
                                          bind:value={dateStr}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="published-{id}" class="whitespace-nowrap">Veröffentlicht</Label>
                    <input type="hidden" name="isPublished" value={formAlbum.isPublished ? 'on' : ''}/>
                    <Checkbox id="published-{id}" bind:checked={formAlbum.isPublished}/>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="dateText-{id}">Datumsanzeige (optional)</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="dateText" id="dateText-{id}" placeholder="z. B. 2025 oder 27.–28. Oktober 2018"
                                          bind:value={formAlbum.dateText}></InputGroup.Input>
                    </InputGroup.Root>
                    <p class="text-muted-foreground text-sm">
                        Wird statt des Datums angezeigt. Das Datum bestimmt trotzdem Reihenfolge und Jahr in der Galerie.
                    </p>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="cover-{id}">Vorschaubild</Label>
                    <div class="w-full max-w-xs aspect-[4/3] rounded-md overflow-hidden bg-muted grid place-items-center text-muted-foreground">
                        {#if formAlbum.coverUrl}
                            <img src={formAlbum.coverUrl} alt="" referrerpolicy="no-referrer" class="w-full h-full object-cover"/>
                        {:else}
                            <Image size="28"/>
                        {/if}
                    </div>
                    <InputGroup.Root>
                        <InputGroup.Input name="coverUrl" id="cover-{id}" placeholder="https://lh3.googleusercontent.com/…"
                                          bind:value={formAlbum.coverUrl}></InputGroup.Input>
                    </InputGroup.Root>
                    <p class="text-muted-foreground text-sm">
                        Standard ist das Titelbild des Albums. Für ein anderes Foto: in Google Fotos öffnen, Rechtsklick
                        → „Bildadresse kopieren“ und hier einfügen.
                    </p>
                </div>
            </div>
        </Card>

        <BackButton></BackButton>
        {#if id}
            <PlaceAtBottom>
                <a href={`/l/dialogs/history/album/${id}`} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-foreground hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <History class="w-7 h-7"/>
                </a>
            </PlaceAtBottom>
            <PlaceAtBottom>
                <button type="submit" form="albumForm" name="deleteAction" value="true" formnovalidate class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-destructive cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <Trash class="w-7 h-7"/>
                </button>
            </PlaceAtBottom>
        {/if}
        <SaveButton form="albumForm"></SaveButton>
    </form>
{/await}

{#if submitting || loadingPreview}
    <Loading/>
{/if}
