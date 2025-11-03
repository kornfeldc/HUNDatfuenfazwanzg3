<script lang="ts">
    import {CircleX} from "@lucide/svelte";
    import GlassBar from "$lib/components/global/GlassBar.svelte";
    import { onMount, tick } from "svelte";
    
    interface IProps {
        value?: any;
    }
    
    let {
        value = $bindable("")
    }: IProps = $props();

    let inputEl: HTMLInputElement | null = null;

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

    onMount(async () => {
        // Wait for the DOM to flush; focus/select only on desktop-like devices
        await tick();
        if (isDesktopLike()) {
            inputEl?.focus();
            inputEl?.select?.();
        }
    });
</script>

<GlassBar>
    <input
            bind:this={inputEl}
            style="width: calc(100vw - 9em);"
            class="border-0 m-0 p-1.5 bg-transparent rounded-full mr-1 text-white placeholder-gray-200 text-base"
            type="text"
            placeholder="Suche"
            bind:value={value}
            oninput={(e) => startSearch(e.currentTarget.value)}
            onkeydown={(e) => handleKeyDown(e)} />
    <button onclick={(event) => clearSearch(event)} class="pr-2 text-gray-200">
        <CircleX/>
    </button>
</GlassBar>
    
