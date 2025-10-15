<script lang="ts">
    import GlassCircle from "./GlassCircle.svelte";
    let {children, href = "", className = ""} = $props();
</script>
<GlassCircle {className}>
    {#if href}
        <a href={href}>
            {@render children?.()}
        </a>
    {:else}
        {@render children?.()}
    {/if}
</GlassCircle>
