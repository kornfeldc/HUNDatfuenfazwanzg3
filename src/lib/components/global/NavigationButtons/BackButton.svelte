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
    <GlassCircleLink className={" bg-accent/50! border-0 drop-shadow-accent/90 drop-shadow-xl " + className} {href}>
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
