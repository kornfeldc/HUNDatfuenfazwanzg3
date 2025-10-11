<script lang="ts">
    import {Search, X, CircleX} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
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

    const clearSearch = () => {
        openSearch(false);
        startSearch("");
    }
    const startSearch = (value: string) => {
        searchString = value;
        onSearch(searchString);
    }
</script>
{#if !uiState.showSearchBar}
    <button onclick={() => openSearch()}>
        <GlassCircleLink>
            <Search class="text-slate-500"/>
        </GlassCircleLink>
    </button>
{:else}
    <PlaceAtBottom>
        <GlassBar>
            <input
                style="width: calc(100vw - 9em)"
                class="border-0 m-0 p-1.5 bg-transparent rounded-full mr-1 text-white placeholder-gray-200"
                type="text"
                placeholder="Suche"
                bind:value={searchString}
                oninput={(e) => startSearch(e.currentTarget.value)}/>
            <button onclick={() => clearSearch()} class="pr-2 text-gray-200">
                <CircleX/>
            </button>
        </GlassBar>
    </PlaceAtBottom>
    <PlaceAtBottom at="right">
        <button onclick={() => openSearch(false)}>
            <GlassCircleLink>
                <X></X>
            </GlassCircleLink>
        </button>
    </PlaceAtBottom>
{/if}