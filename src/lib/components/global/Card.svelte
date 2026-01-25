<script lang="ts">
    let {children, href = "", className = ""} = $props();
    const classes = "p-4 shadow-lg shadow-slate-300 dark:shadow-gray-800/80 dark:bg-gray-500/10 rounded-lg " + className;
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
