<script lang="ts">
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

<PersistentSearchBar/>
<div class="pb-24 md:pb-4">
    {@render children?.()}
</div>
