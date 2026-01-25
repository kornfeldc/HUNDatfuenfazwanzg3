<script lang="ts">
    let { children, className = "" } = $props();
</script>
<div class={"flex bg-slate-900/40 dark:bg-white/10 p-1.5 rounded-4xl backdrop-blur-md w-min font-mono uppercase text-sm shadow-xl border border-white/20 dark:border-white/10 "+className}>
    {@render children?.()}
</div>
