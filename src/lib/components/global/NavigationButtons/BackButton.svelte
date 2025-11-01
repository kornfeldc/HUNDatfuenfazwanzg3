<script lang="ts">
    import {ArrowLeft} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";

    let {href = "", className = ""} = $props();

    const onclick = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        const returnTo = sessionStorage.getItem("returnTo");
        if(returnTo) 
            window.location.href = returnTo;
        else 
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
