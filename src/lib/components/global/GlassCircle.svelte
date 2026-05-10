<script lang="ts">
    import { dockActionsStore } from "$lib/stores/dockActionsStore.svelte";

    let {children, className = ""} = $props();

    // When rendered inside the mobile dock, show as a compact icon with matching color
    const inDock = $derived(dockActionsStore.renderingInDock);

    // Map bg color class to text color class for dock icon coloring
    function bgToTextColor(cls: string): string {
        if (cls.includes('bg-destructive')) return 'text-destructive';
        if (cls.includes('bg-ok')) return 'text-ok';
        if (cls.includes('bg-primary')) return 'text-primary';
        // bg-accent has a black foreground (#000), so use text-foreground (white in dark mode) for visibility
        return 'text-foreground';
    }

    const dockIconColor = $derived(bgToTextColor(className));
</script>
{#if inDock}
    <!-- Dock mode: just the icon, no circle background — let Dock.Icon handle hover -->
    <span class={"flex items-center justify-center cursor-pointer w-full h-full " + dockIconColor}>
        {@render children?.()}
    </span>
{:else}
    <div class={"cursor-pointer flex bg-white/15 dark:bg-black/40 border border-white/30 dark:border-white/10 shadow-md p-2 rounded-full backdrop-blur-sm w-12 h-12 items-center justify-center transition-colors hover:bg-white/25 "+className}>
        {@render children?.()}
    </div>
{/if}
