<script lang="ts">
    let { children, className = "" } = $props();
</script>
<div class={"flex bg-gray-900/50 dark:bg-primary/20 p-1.5 rounded-4xl backdrop-blur-sm w-min font-mono uppercase text-sm drop-shadow-2xl drop-shadow-slate-500/50 dark:drop-shadow-slate-500/70 "+className}>
    {@render children?.()}
</div>
