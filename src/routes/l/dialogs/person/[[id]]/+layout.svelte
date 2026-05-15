<script lang="ts">
    import {page} from '$app/stores';
    import Pill from "$lib/components/global/Pill.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
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
<BackButton></BackButton>
{#if data.id}
    <PlaceAtBottom>
        <a href={`/l/dialogs/history/person/${data.id}`} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-foreground hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <History class="w-7 h-7"/>
        </a>
    </PlaceAtBottom>
{/if}
