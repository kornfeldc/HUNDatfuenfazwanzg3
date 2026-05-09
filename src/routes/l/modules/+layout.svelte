<script lang="ts">
    import TopBar from "$lib/components/global/TopBar.svelte";
    import NavigationBar from "$lib/components/global/NavigationBar.svelte";
    import PersistentSearchBar from "$lib/components/global/PersistentSearchBar.svelte";
    import { uiState } from "$lib/stores/uiState.svelte";
    import { page } from "$app/stores";

    let { children } = $props();

    $effect(() => {
        // reset search when navigating to a new module
        $page.url.pathname;
        uiState.searchString = "";
    });
</script>

<TopBar/>
<PersistentSearchBar/>
{@render children?.()}
<NavigationBar/>
