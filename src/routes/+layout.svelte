<script lang="ts">
    import '../app.css';
    import {afterNavigate} from '$app/navigation';
    import {page} from '$app/stores';
    import {onMount} from 'svelte';
    import {uiState} from '$lib/stores/uiState.svelte';
    import favicon from '$lib/assets/favicon.svg';

    let {children} = $props();

    // Push the initial route once the app mounts on the client
    onMount(() => {
        uiState.pushRoute($page.url.pathname);
    });

    // Track every client-side route change
    afterNavigate(({to}) => {
        const url = to?.url;
        if (!url) return;
        // capture pathname + search (+ hash if desired)
        const fullPath = url.pathname + url.search + url.hash; // drop + url.hash if you don't want hashes
        uiState.pushRoute(fullPath);
    });
</script>

<svelte:head>
    <link href={favicon} rel="icon"/>
</svelte:head>

{@render children?.()}
