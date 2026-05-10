<script lang="ts">
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import { Save } from "@lucide/svelte";
    import { dockActionsStore } from "$lib/stores/dockActionsStore.svelte";
    let {className = ""} = $props();
    const inDock = $derived(dockActionsStore.renderingInDock);
</script>
<GlassCircleLink className={" bg-ok! border-0 text-white shadow-md " + (inDock ? "" : "w-30 ") + className}>
    <Save class="w-5 h-5 shrink-0"/>
    {#if !inDock}
        <span>Speichern</span>
    {/if}
</GlassCircleLink>
