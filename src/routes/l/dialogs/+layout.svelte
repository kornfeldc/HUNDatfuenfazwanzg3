<script lang="ts">
	import TopBar from "$lib/components/global/TopBar.svelte";

    let { children } = $props();
</script>
<TopBar/>
<div class="px-4">
    {@render children?.()}
</div>
