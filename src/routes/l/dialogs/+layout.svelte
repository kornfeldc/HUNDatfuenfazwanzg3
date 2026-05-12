<script lang="ts">
    import PersistentSearchBar from "$lib/components/global/PersistentSearchBar.svelte";
    import MobileBreadcrumb from "$lib/components/global/MobileBreadcrumb.svelte";
    import { uiState } from "$lib/stores/uiState.svelte";
    import { page } from "$app/stores";
    import { breadcrumbStore } from "$lib/stores/breadcrumbStore.svelte";

    let { children } = $props();

    const hideSearchBar = $derived([
        '/l/dialogs/article',
        '/l/dialogs/person',
        '/l/dialogs/rob'
    ].some(path => $page.url.pathname.startsWith(path)));

    $effect(() => {
        // reset search and breadcrumb detail when navigating to a new dialog
        $page.url.pathname;
        uiState.searchString = "";
        breadcrumbStore.detailLabel = "";
    });
</script>
<MobileBreadcrumb />
{#if !hideSearchBar}
    <PersistentSearchBar/>
{/if}
<div class="px-4 pb-32 md:pb-4 {hideSearchBar ? 'pt-4 md:pt-6' : ''}">
    {@render children?.()}
</div>
