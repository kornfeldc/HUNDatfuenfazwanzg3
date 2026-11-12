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
    import type {INews} from "$lib/data/hfzApi";
    import {Checkbox} from "$lib/components/shadcn/ui/checkbox";
    import {Trash, History} from '@lucide/svelte';
    import {uiState} from "$lib/stores/uiState.svelte";
    import {moment} from "$lib/util";
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { breadcrumbStore } from '$lib/stores/breadcrumbStore.svelte';

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let formNews = $state({} as INews);
    let dateStr = $state("");
    let submitting = $state(false);
    let errorMessage = $state("");

    const loadNews = async () => {
        const news = await data.news;
        formNews.id = news?.id;
        formNews.title = news?.title ?? "";
        formNews.content = news?.content ?? "";
        formNews.isPublished = news?.isPublished ?? true;
        dateStr = moment(news?.date ?? new Date()).format('YYYY-MM-DD');
        breadcrumbStore.detailLabel = formNews.title || 'Neue News';
    }
</script>

{#await loadNews()}
    <Loading></Loading>
{:then _}
    <form id="newsForm" method="post" action={id ? `/l/dialogs/news/${id}` : `/l/dialogs/news`} use:enhance={({ formData }) => {
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
            <CardTitleBig className="hidden sm:block pb-2">{formNews.id ? formNews.title : "Neue News"}</CardTitleBig>
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="title-{id}">Titel</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="title" id="title-{id}" required
                                          bind:value={formNews.title}></InputGroup.Input>
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
                    <input type="hidden" name="isPublished" value={formNews.isPublished ? 'on' : ''}/>
                    <Checkbox id="published-{id}" bind:checked={formNews.isPublished}/>
                </div>

                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="content-{id}">Text</Label>
                    <InputGroup.Root>
                        <InputGroup.Textarea name="content" id="content-{id}" rows={8}
                                             bind:value={formNews.content}></InputGroup.Textarea>
                    </InputGroup.Root>
                    <p class="text-muted-foreground text-sm">
                        Nur veröffentlichte News erscheinen auf der Homepage. Die Wörter KURSE, KALENDER, FOTOS,
                        KONTAKT, EVENTS und VEREIN sowie E-Mail-Adressen werden dort automatisch verlinkt.
                    </p>
                </div>
            </div>
        </Card>

        <BackButton></BackButton>
        {#if id}
            <PlaceAtBottom>
                <a href={`/l/dialogs/history/news/${id}`} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-foreground hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <History class="w-7 h-7"/>
                </a>
            </PlaceAtBottom>
            <PlaceAtBottom>
                <button type="submit" form="newsForm" name="deleteAction" value="true" formnovalidate class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-destructive cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    <Trash class="w-7 h-7"/>
                </button>
            </PlaceAtBottom>
        {/if}
        <SaveButton form="newsForm"></SaveButton>
    </form>
{/await}

{#if submitting}
    <Loading/>
{/if}
