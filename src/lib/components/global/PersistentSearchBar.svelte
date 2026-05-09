<script lang="ts">
    import { Search, CircleX } from "@lucide/svelte";
    import { uiState } from "$lib/stores/uiState.svelte";
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    const hiddenRoutes = ["/pay", "/calendar", "/statistics"];
    const isHidden = $derived(hiddenRoutes.some(r => $page.url.pathname.endsWith(r)));

    let visible = $state(true);
    let lastScrollY = $state(0);
    let inputEl: HTMLInputElement | null = null;

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 10) {
            visible = true;
        } else if (currentScrollY > lastScrollY + 4) {
            visible = false;
        } else if (currentScrollY < lastScrollY - 4) {
            visible = true;
        }
        lastScrollY = currentScrollY;
    };

    onMount(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    });

    const clear = () => {
        uiState.searchString = "";
        inputEl?.focus();
    };
</script>

{#if !isHidden}
<div
    class="sticky top-0 z-40 w-full flex justify-center px-3 py-2 transition-all duration-300 {visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}"
>
    <!-- Mobile: full width. Desktop: floating pill -->
    <div class="
        flex items-center gap-2
        w-full sm:w-auto sm:min-w-80 sm:max-w-lg
        bg-slate-900/30 dark:bg-white/10
        border border-white/20 dark:border-white/10
        backdrop-blur-sm shadow-xl
        rounded-full px-4 py-2
    ">
        <Search class="shrink-0 text-gray-400 dark:text-gray-300 w-4 h-4" />
        <input
            bind:this={inputEl}
            bind:value={uiState.searchString}
            class="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder-gray-400 dark:placeholder-gray-300 min-w-0"
            placeholder="Suche…"
            type="text"
        />
        {#if uiState.searchString}
            <button onclick={clear} class="shrink-0 text-gray-400 dark:text-gray-300 hover:text-white transition-colors">
                <CircleX class="w-4 h-4" />
            </button>
        {/if}
    </div>
</div>
{/if}
