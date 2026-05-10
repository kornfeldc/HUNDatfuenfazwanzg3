<script lang="ts">
    import {Util} from "$lib/util";
    import {uiState} from "$lib/stores/uiState.svelte";
    import {dockActionsStore} from "$lib/stores/dockActionsStore.svelte";
    import {untrack} from "svelte";

    let {children, at = 'left', top = false} = $props();

    let bottomClass = $derived.by(() => {
        return (uiState.showPlaceAtBottomOnTop() || top ? "fixed top-0" : "fixed bottom-0") + " "+
            (top ? "bg-background/80 shadow-background shadow-xl h-20" : "");
    });

    // Register our children snippet into the dock store so MobileDock can render it
    $effect(() => {
        if (!children) return;
        untrack(() => dockActionsStore.actionsList.push(children));
        return () => {
            untrack(() => {
                const idx = dockActionsStore.actionsList.indexOf(children!);
                if (idx !== -1) dockActionsStore.actionsList.splice(idx, 1);
            });
        };
    });
</script>
{#if uiState.showPlaceAtBottomOnTop()}
    <div class={"fixed top-0 w-full  shadow-background/80 shadow-lg  h-18"}></div>
{/if}
<!-- Desktop (md+): hidden — the DesktopDock handles action button rendering on desktop -->
