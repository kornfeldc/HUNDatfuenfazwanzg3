<script lang="ts">
    import {page} from '$app/stores';
    import Pill from "$lib/components/global/Pill.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import {History} from "@lucide/svelte";
    import {onMount} from "svelte";
    import {uiState} from "$lib/stores/uiState.svelte";

    let subRoute = $derived.by(() => {
        const parts = $page.url.pathname.split('/').filter(Boolean);
        return parts[parts.length - 1] ?? 'data';
    });

    let {data, children} = $props();

    const filterItems = [
        {id: "data", label: "Stammdaten"},
        {id: "history", label: "Historie"}
    ];

    onMount(() => {
        uiState.showNavBar = true;
        uiState.showActions = true;
        uiState.showSearchBar = false;
    });
</script>

{#if data.id}
    <div class="flex flex-wrap pb-2">
        {#each filterItems as item}
            <Pill selected={subRoute === item.id}>
                <a href={item.id}>{item.label}</a>
            </Pill>
        {/each}
    </div>
{/if}
{@render children?.()}
<PlaceAtBottom>
    <BackButton></BackButton>
    {#if data.id}
        <GlassCircleLink href={`/l/dialogs/history/person/${data.id}`} className={"bg-accent/70! dark:bg-gray-500/90! border-0 shadow-sm"}>
            <History class="text-accent-foreground"/>
        </GlassCircleLink>
    {/if}
</PlaceAtBottom>
