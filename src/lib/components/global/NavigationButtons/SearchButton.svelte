<script lang="ts">
    import {Search, X, CircleX} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import SearchBar from "$lib/components/global/SearchBar.svelte";
    import type {IPerson} from "$lib/data/hfzApi";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import GlassBar from "$lib/components/global/GlassBar.svelte";

    let searchString = $state("");

    interface IProps {
        onSearch: (searchString: string) => void;
    }

    let {onSearch}: IProps = $props();

    const openSearch = (open = true) => {
        uiState.showSearchBar = open;
        uiState.showNavBar = !open;
        uiState.showActions = !open;
    }
    
    $effect(() => {
        onSearch(searchString);
    });
</script>
{#if !uiState.showSearchBar}
    <button onclick={() => openSearch()}>
        <GlassCircleLink className="bg-gray-400/30! border-0 drop-shadow-gray-500/40 drop-shadow-xl" >
            <Search class="text-gray-600"/>
        </GlassCircleLink>
    </button>
{:else}
    <PlaceAtBottom>
        <SearchBar bind:value={searchString}></SearchBar>
    </PlaceAtBottom>
    <PlaceAtBottom at="right">
        <button onclick={() => openSearch(false)}>
            <GlassCircleLink>
                <X></X>
            </GlassCircleLink>
        </button>
    </PlaceAtBottom>
{/if}