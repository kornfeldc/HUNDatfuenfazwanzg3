<script lang="ts">
    let { children, className = "" } = $props();
</script>
<div class={"flex bg-black/40 dark:bg-white/5 p-1.5 rounded-4xl backdrop-blur-lg w-min font-mono uppercase text-sm shadow-2xl border border-white/10 "+className}>
    {@render children?.()}
</div>
