<script lang="ts">
    // noinspection ES6UnusedImports
    import * as Dock from "$lib/components/shadcn/ui/dock";
    import { dockActionsStore } from "$lib/stores/dockActionsStore.svelte";

    const hasActions = $derived(dockActionsStore.actionsList.length > 0);

    // Set renderingInDock so GlassCircle renders in compact icon-only mode
    $effect(() => {
        const active = hasActions;
        dockActionsStore.renderingInDock = active;
        return () => { dockActionsStore.renderingInDock = false; };
    });
</script>

<!-- Desktop action dock: shown only on md+ screens, bottom-right, only when actions are registered -->
{#if hasActions}
<div class="hidden md:flex fixed bottom-4 right-4 z-50 pointer-events-none">
    <div class="pointer-events-auto">
        <Dock.Root class="bg-background/50! backdrop-blur-md shadow-lg">
            {#each dockActionsStore.actionsList as actionSnippet}
                {@render actionSnippet()}
            {/each}
        </Dock.Root>
    </div>
</div>
{/if}
