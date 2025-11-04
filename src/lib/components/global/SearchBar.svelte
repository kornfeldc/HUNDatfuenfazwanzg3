<script lang="ts">
    import {CircleX} from "@lucide/svelte";
    import GlassBar from "$lib/components/global/GlassBar.svelte";
    import { onMount, onDestroy, tick } from "svelte";
    import {uiState} from "$lib/stores/uiState.svelte";

    interface IProps {
        value?: any;
        fullWidth?: boolean;
    }
    
    let {
        value = $bindable(""),
        fullWidth = false,
    }: IProps = $props();

    let inputEl: HTMLInputElement | null = null;
    
    let calcWidth = $derived(fullWidth ? "calc(100vw - 4.5em)" : "calc(100vw - 9em)");

    // Detect desktop-like environments (precise pointer + hover)
    const isDesktopLike = () =>
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const clearSearch = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        startSearch("");
        // Only refocus on desktop to avoid popping the virtual keyboard
        if (isDesktopLike()) inputEl?.focus();
        return false;
    }
    const startSearch = (val: string) => {
        value = val;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            event.preventDefault();
            inputEl?.blur();
        }
    }
    
    const inputFocused = () => {
       uiState.isSearchInputFocusedMobile = !isDesktopLike(); 
       console.log("inputFocused", uiState.isSearchInputFocusedMobile);
    }

    const inputBlurred = () => {
        uiState.isSearchInputFocusedMobile = false;
        console.log("inputFocused", uiState.isSearchInputFocusedMobile);
    }

    onMount(async () => {
        // Wait for the DOM to flush; focus/select only on desktop-like devices
        await tick();
        if (isDesktopLike()) {
            inputEl?.focus();
            inputEl?.select?.();
            inputFocused();
        }
    });
    
    onDestroy(() => {
        uiState.isSearchInputFocusedMobile = false;
    });
</script>

<GlassBar>
    <input
            bind:this={inputEl}
            style={"width: "+calcWidth}
            class="border-0 m-0 p-1.5 bg-transparent rounded-full mr-1 text-white placeholder-gray-200 text-base"
            type="text"
            placeholder="Suche"
            bind:value={value}
            onfocus={(event) => inputFocused()}
            onblur={(event) => inputBlurred()}
            oninput={(e) => startSearch(e.currentTarget.value)}
            onkeydown={(e) => handleKeyDown(e)} />
    <button onclick={(event) => clearSearch(event)} class="pr-2 text-gray-200">
        <CircleX/>
    </button>
</GlassBar>
    
