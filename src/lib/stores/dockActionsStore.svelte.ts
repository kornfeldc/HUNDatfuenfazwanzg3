import type { Snippet } from "svelte";

export const dockActionsStore = $state({
    /** Snippets registered by PlaceAtBottom instances on dialog pages; rendered by MobileDock on mobile */
    actionsList: [] as Snippet[],
    /** True when currently rendering inside the mobile dock (used by GlassCircle for dock-mode styling) */
    renderingInDock: false,
});
