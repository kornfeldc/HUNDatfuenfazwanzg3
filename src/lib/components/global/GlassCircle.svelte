<script lang="ts">
    let {children, className = ""} = $props();
</script>
<div class={"cursor-pointer flex bg-white/15 dark:bg-black/40 border border-white/30 dark:border-white/10 shadow-md p-2 rounded-full backdrop-blur-sm w-12 h-12 items-center justify-center transition-colors hover:bg-white/25 "+className}>
    {@render children?.()}
</div>
