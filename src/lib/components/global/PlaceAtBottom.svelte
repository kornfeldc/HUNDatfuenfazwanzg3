<script lang="ts">
    import {Util} from "$lib/util";
    import {uiState} from "$lib/stores/uiState.svelte";
    let {children, at = 'left', top = false} = $props();
    
    let bottomClass = $derived.by(()=> {
        return uiState.showPlaceAtBottomOnTop() || top ? "fixed top-0" : "fixed bottom-0";
    } );
</script>
{#if uiState.showPlaceAtBottomOnTop() || top}
    <div class="fixed top-0 w-full bg-background/90 shadow-background/80 shadow-lg blur-sm h-18"></div>
{/if}
<div class={Util.mapClass(`${bottomClass} p-3 flex gap-2`, at === 'left', "left-0", "right-0")}>
    {@render children?.()}
</div>
