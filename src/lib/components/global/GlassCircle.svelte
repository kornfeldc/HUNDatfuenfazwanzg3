<script lang="ts">
    let {children, className = ""} = $props();
</script>
<div class={"cursor-pointer flex bg-transparent drop-shadow-md drop-shadow-gray-200 dark:drop-shadow-none p-2 rounded-full backdrop-blur-sm w-12 h-12 items-center justify-center "+className}>
    {@render children?.()}
</div>
