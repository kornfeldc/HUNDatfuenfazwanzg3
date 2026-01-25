<script lang="ts">
    import {ArrowLeft} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import {goto} from "$app/navigation";

    let {href = "", className = ""} = $props();

    const onclick = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        
        const lastModule = uiState.getLastRouteSmart();
        if(lastModule) {
            goto(lastModule);
            return false;
        }
        
        history.back();
        return false;
    }
</script>
{#snippet circleLink()}
    <GlassCircleLink className={" bg-accent/70! dark:bg-gray-500/90! border-0 shadow-sm " + className} {href}>
        <ArrowLeft class="text-accent-foreground"/>
    </GlassCircleLink>
{/snippet}
{#if href}
    {@render circleLink()}
{:else}
    <button {onclick}>
        {@render circleLink()}
    </button>
{/if}
