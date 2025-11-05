<script lang="ts">
    import {CircleX} from "@lucide/svelte";
    import GlassBar from "$lib/components/global/GlassBar.svelte";
    import {onMount, tick} from "svelte";
    import {Util} from "$lib/util";

    interface IProps {
        value?: any;
        fullWidth?: boolean;
        onEnter?: () => void;
        onClear?: () => void;
        // stayOpenedOnBlur?: boolean;
        // onSearchOrBlur?: (event: any) => void;
    }

    let inputEl: HTMLInputElement | null = null;

    let {
        value = $bindable(""),
        fullWidth = false,
        onEnter = undefined,
        onClear = undefined,
        // stayOpenedOnBlur = false,
        // onSearchOrBlur = undefined,
    }: IProps = $props();

    const inputFocused = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    const inputBlurred = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter") 
            return;
        event.preventDefault();
        if(onEnter) 
            onEnter();
    }

    const clearSearch = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        value = "";
        if(onClear) 
            onClear();
        return false;
    }

    onMount(async () => {
        await tick();
        inputEl?.focus();
        inputEl?.select?.();
    });

    let calcWidth = $derived(fullWidth ? "calc(100vw - 4.5em)" : "calc(100vw - 7em)");
    // let clearClicked = $state(false);
    //
    // // Detect desktop-like environments (precise pointer + hover)
    // const isDesktopLike = () =>
    //     typeof window !== 'undefined' &&
    //     typeof window.matchMedia === 'function' &&
    //     window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    //
    // const clearSearch = (event: Event) => {
    //     event.stopPropagation();
    //     event.preventDefault();
    //     clearClicked = true;
    //     value = "";
    //     setTimeout(() => {
    //         clearClicked = false;
    //         inputEl?.focus();
    //         inputEl?.select?.();
    //     }, 200);
    //     return false;
    // }
    // const startSearch = (val: string) => {
    //     value = val;
    // }
    //
    //
    // const inputFocused = () => {
    //     clearClicked = false;
    //     uiState.isSearchInputFocusedMobile = !isDesktopLike();
    // }
    //
    // const inputBlurred = (event: any) => {
    //     event.stopPropagation();
    //     event.preventDefault();
    //     setTimeout(() => {
    //         if (clearClicked) {
    //             clearClicked = false;
    //             return;
    //         }
    //
    //         if (onSearchOrBlur)
    //             onSearchOrBlur(event);
    //         if (stayOpenedOnBlur)
    //             return;
    //
    //         uiState.isSearchInputFocusedMobile = false;
    //         if (!isDesktopLike()) {
    //             uiState.showSearchBar = false;
    //             uiState.showActions = true;
    //             uiState.showNavBar = true;
    //         }
    //     }, 100);
    //     return false;
    // }
    //
    // onMount(async () => {
    //     clearClicked = false;
    //     await tick();
    //     inputFocused();
    //     if (!isDesktopLike())
    //         await tick();
    //     inputEl?.focus();
    //     inputEl?.select?.();
    // });
    //
    // onDestroy(() => {
    //     uiState.isSearchInputFocusedMobile = false;
    // });
</script>

<GlassBar className="w-full">
    <div class="flex items-center" style={`width: ${calcWidth}`}>
        <input
                bind:this={inputEl}
                bind:value={value}
                class={Util.mapClass("border-0 m-0 p-1.5 mr-2 bg-transparent rounded-full text-white placeholder-gray-200 text-base", true, "w-full", "")}
                onblur={(event) => inputBlurred(event)}
                onfocus={(event) => inputFocused(event)}
                onkeydown={(e) => handleKeyDown(e)}
                placeholder="Suche"
                type="text"/>

        <button class="pr-2 text-gray-200"
                onclick={(event) => clearSearch(event)}>
            <CircleX/>
        </button>

        <!--    <input-->
        <!--            bind:this={inputEl}-->
        <!--            bind:value={value}-->
        <!--            class={Util.mapClass("border-0 m-0 p-1.5 bg-transparent rounded-full text-white placeholder-gray-200 text-base", stayOpenedOnBlur, "mr-12", "mr-1")}-->
        <!--            onblur={(event) => inputBlurred(event)}-->
        <!--            onfocus={() => inputFocused()}-->
        <!--            oninput={(e) => startSearch(e.currentTarget.value)}-->
        <!--            onkeydown={(e) => handleKeyDown(e)}-->
        <!--            placeholder="Suche"-->
        <!--            style={`width: ${calcWidth}`}-->
        <!--            type="text"/>-->
        <!--    {#if !stayOpenedOnBlur}-->
        <!--        <button class="pr-2 text-gray-200"-->
        <!--                ontouchstart={(event) => clearSearch(event)}-->
        <!--                onmousedown={(event) => clearSearch(event)}>-->
        <!--            <CircleX/>-->
        <!--        </button>-->
        <!--    {/if}-->

    </div>
</GlassBar>
