<script lang="ts">
    import { Search, CircleX } from "@lucide/svelte";
    import { uiState } from "$lib/stores/uiState.svelte";
    import { page } from "$app/stores";

    const hiddenRoutes = ["/pay", "/calendar", "/statistics"];
    const isHidden = $derived(hiddenRoutes.some(r => $page.url.pathname.endsWith(r)));

    let inputEl: HTMLInputElement | null = null;

    const clear = () => {
        uiState.searchString = "";
        inputEl?.focus();
    };
</script>

{#if !isHidden}
<div
    class="sticky top-0 z-40 w-full flex justify-center px-3 py-2"
>
    <!-- Mobile: full width. Desktop: floating pill -->
    <div class="
        flex items-center gap-2
        w-full sm:w-auto sm:min-w-80 sm:max-w-lg
        bg-background/80 dark:bg-white/10
        border border-border dark:border-white/10
        backdrop-blur-sm shadow-xl
        rounded-full px-4 py-2
    ">
        <Search class="shrink-0 text-muted-foreground w-4 h-4" />
        <input
            bind:this={inputEl}
            bind:value={uiState.searchString}
            class="flex-1 bg-transparent border-0 outline-none text-base text-foreground placeholder-muted-foreground min-w-0"
            placeholder="Suche…"
            type="text"
        />
        {#if uiState.searchString}
            <button onclick={clear} class="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                <CircleX class="w-4 h-4" />
            </button>
        {/if}
    </div>
</div>
{/if}
