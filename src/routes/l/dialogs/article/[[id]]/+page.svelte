<script lang="ts">
    import {page} from '$app/stores';
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    import {Label} from "$lib/components/shadcn/ui/label";
    // noinspection ES6UnusedImports
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";
    // noinspection ES6UnusedImports
    import * as Select from "$lib/components/shadcn/ui/select/index.js";

    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import {ArticleTypes, type IArticle} from "$lib/data/hfzApi";
    import {Checkbox} from "$lib/components/shadcn/ui/checkbox";
    import {onMount} from "svelte";

    let id = $page.params.id;
    let {data}: { data: any; } = $props();
    let formArticle = $state({} as IArticle);

    const loadArticle = async () => {
        const article = await data.article;
        formArticle.id = article?.id;
        formArticle.price = article?.price ?? 0;
        formArticle.title = article?.title ?? "Neuer Artikel";
        formArticle.type = article?.type ?? "other";
        formArticle.isFavorite = article?.isFavorite ?? false;
        formArticle.isActive = article?.isActive ?? true;
    }
</script>

{#await loadArticle()}
    <Loading></Loading>
{:then _}
    <form method="post" action={id ? `/l/dialogs/article/${id}` : `/l/dialogs/article`}>
        <Card className="max-w-xl m-auto">
            <CardTitleBig className="hidden sm:block pb-2">{formArticle.id ? formArticle.title : "Neuer Artikel"}</CardTitleBig>
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 flex flex-col gap-2">
                    <Label for="title-{id}">Bezeichnung</Label>
                    <InputGroup.Root>
                        <InputGroup.Input name="title" id="title-{id}"
                                          bind:value={formArticle.title}></InputGroup.Input>
                    </InputGroup.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="type-{id}">Art</Label>
                    <Select.Root type="single" name="type" bind:value={formArticle.type}>
                        <Select.Trigger class="w-full">{ArticleTypes[formArticle.type]}</Select.Trigger>
                        <Select.Content>
                            {#each Object.keys(ArticleTypes) as type}
                                <Select.Item value={type}>{ArticleTypes[type]}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="price-{id}">Preis</Label>
                    <InputGroup.Root>
                        <InputGroup.Addon>
                            <InputGroup.Text>€</InputGroup.Text>
                        </InputGroup.Addon>
                        <InputGroup.Input class="text-right" name="price" bind:value={formArticle.price} id="price-{id}"
                                          step="0.01"
                                          type="number"/>
                    </InputGroup.Root>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="favorite-{id}" class="whitespace-nowrap">Ist Favorit</Label>
                    <input type="hidden" name="isFavorite" value={formArticle.isFavorite ? 'on' : ''}/>
                    <Checkbox id="favorite-{id}" bind:checked={formArticle.isFavorite}/>
                </div>

                <div class="col-span-6 flex flex-col gap-2">
                    <Label for="active-{id}" class="whitespace-nowrap">Ist Aktiv</Label>
                    <input type="hidden" name="isActive" value={formArticle.isActive ? 'on' : ''}/>
                    <Checkbox id="active-{id}" bind:checked={formArticle.isActive}/>
                </div>
            </div>
        </Card>

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
