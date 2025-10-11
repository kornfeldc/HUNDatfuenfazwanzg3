<script lang="ts">
    let {children} = $props();
</script>
<div class="flex bg-transparent drop-shadow-md drop-shadow-gray-200 p-2 rounded-full backdrop-blur-sm w-12 h-12 items-center justify-center ">
    {@render children?.()}
</div>
