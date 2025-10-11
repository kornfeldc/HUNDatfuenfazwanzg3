<script lang="ts">
    import TopBar from "$lib/components/global/TopBar.svelte";
    import NavigationBar from "$lib/components/global/NavigationBar.svelte";

    let { children } = $props();
</script>

<TopBar/>
{@render children?.()}
<NavigationBar/>
