<script lang="ts">
    let {children, className = ""} = $props();
</script>
<div class={"cursor-pointer flex bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-lg p-2 rounded-full backdrop-blur-md w-12 h-12 items-center justify-center transition-colors hover:bg-white/20 "+className}>
    {@render children?.()}
</div>
