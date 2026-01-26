<script lang="ts">
    let {children, href = "", className = ""} = $props();
    const classes = "p-3 sm:p-4 shadow-lg bg-card text-card-foreground border border-border/50 rounded-lg " + className;
</script>
{#if href}
    <a {href} class={classes}>
        {@render children?.()}
    </a>
{:else}
    <div class={classes}>
        {@render children?.()}
    </div>
{/if}
