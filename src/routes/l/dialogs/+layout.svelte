<script lang="ts">
    import PersistentSearchBar from "$lib/components/global/PersistentSearchBar.svelte";
    import MobileBreadcrumb from "$lib/components/global/MobileBreadcrumb.svelte";
    import { uiState } from "$lib/stores/uiState.svelte";
    import { page } from "$app/stores";
    import { breadcrumbStore } from "$lib/stores/breadcrumbStore.svelte";

    let { children } = $props();

    $effect(() => {
        // reset search and breadcrumb detail when navigating to a new dialog
        $page.url.pathname;
        uiState.searchString = "";
        breadcrumbStore.detailLabel = "";
    });
</script>
<MobileBreadcrumb />
<PersistentSearchBar/>
<div class="px-4 pb-32 md:pb-4">
    {@render children?.()}
</div>
