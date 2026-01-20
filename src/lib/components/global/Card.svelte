<script lang="ts">
    let {children, href = "", className = ""} = $props();
</script>
{#if href}
    <a {href} class={"p-4 shadow-lg shadow-slate-300 rounded-lg " + className}>
        {@render children?.()}
    </a>
{:else}
    <div class={"p-4 shadow-lg shadow-slate-300 rounded-lg " + className}>
        {@render children?.()}
    </div>
{/if}
