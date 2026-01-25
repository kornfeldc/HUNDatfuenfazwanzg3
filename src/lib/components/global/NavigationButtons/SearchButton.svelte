<script lang="ts">
    import {Search, X, CircleX, Check} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import SearchBar from "$lib/components/global/SearchBar.svelte";
    import type {IPerson} from "$lib/data/hfzApi";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import GlassBar from "$lib/components/global/GlassBar.svelte";
    import SearchBarNavigationWrapper from "$lib/components/global/SearchBarNavigationWrapper.svelte";
    import GlassCircle from "$lib/components/global/GlassCircle.svelte";

    let searchString = $state("");

    interface IProps {
        onSearch: (searchString: string) => void;
    }

    let {onSearch}: IProps = $props();

    const openSearch = (open = true) => {
        uiState.setNavSearch(open);
    }
    
    const onEnter = () => {
       openSearch(false); 
    }

    const onClear = () => {
        //openSearch(false);
    }
    
    $effect(() => {
        onSearch(searchString);
    });
</script>
{#if !uiState.showSearchBar}
    <button onclick={() => openSearch()}>
        <GlassCircleLink className="bg-gray-400/30! border-0 shadow-sm" >
            <Search class="text-gray-600 dark:text-gray-300"/>
        </GlassCircleLink>
    </button>
{:else}
    <PlaceAtBottom>
        <SearchBarNavigationWrapper bind:value={searchString} {onEnter} {onClear}></SearchBarNavigationWrapper>
    </PlaceAtBottom>
    <PlaceAtBottom at="right">
        <button onclick={() => openSearch(false)}>
            <GlassCircle
                    className="bg-primary/70! text-primary-foreground! border-0 shadow-md">
                <Check></Check>
            </GlassCircle>
        </button>
    </PlaceAtBottom>
{/if}