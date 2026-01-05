<script lang="ts">
    import '../app.css';
    import {invalidate} from '$app/navigation';
    import {afterNavigate, beforeNavigate} from '$app/navigation';
    import {page} from '$app/stores';
    import {onDestroy, onMount} from 'svelte';
    import {uiState} from '$lib/stores/uiState.svelte';
    import favicon from '$lib/assets/favicon.svg';
    import {createBrowserClient} from '@supabase/ssr'

    let {data, children} = $props();

    const supabase = createBrowserClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_KEY,
        {
            global: {
                fetch: (...args) => fetch(...args),
            }
        }
    )

    let session = $derived(data.session);

    const isDesktopLike = () =>
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Push the initial route once the app mounts on the client
    onMount(() => {
        uiState.isMobileDevice = !isDesktopLike();
        uiState.pushRoute($page.url.pathname);

        const {data: {subscription}} = supabase.auth.onAuthStateChange((event, _session) => {
            if (_session?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth');
            }
        });

        return () => subscription.unsubscribe();
    });

    // Track every client-side route change
    afterNavigate(({to}) => {
        const url = to?.url;
        if (!url) return;
        // capture pathname + search (+ hash if desired)
        const fullPath = url.pathname + url.search + url.hash; // drop + url.hash if you don't want hashes
        uiState.pushRoute(fullPath);

    });

    beforeNavigate(() => {
        uiState.setNavSearch(false);

    });

    onDestroy(() => {
        uiState.setNavSearch(false);
    });

</script>

<svelte:head>
    <link href={favicon} rel="icon"/>
</svelte:head>

{@render children?.()}
