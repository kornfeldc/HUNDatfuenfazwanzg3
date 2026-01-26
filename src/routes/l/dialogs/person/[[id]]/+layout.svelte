<script lang="ts">
    import {page} from '$app/stores';
    import Pill from "$lib/components/global/Pill.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import {onMount} from "svelte";
    import { uiState } from "$lib/stores/uiState.svelte";

    let subRoute = $derived.by(()=> {
        const parts = $page.url.pathname.split('/').filter(Boolean);
        return parts[parts.length - 1] ?? 'data';
    });

    let {children} = $props();

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

<div class="flex flex-wrap pb-2">
    {#each filterItems as item}
        <Pill selected={subRoute === item.id}>
            <a href={item.id}>{item.label}</a>
        </Pill>
    {/each}
</div>
{@render children?.()}
<PlaceAtBottom>
    <BackButton></BackButton>
</PlaceAtBottom>
