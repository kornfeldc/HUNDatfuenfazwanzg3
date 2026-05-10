<script lang="ts">
    import * as Sidebar from "$lib/components/shadcn/ui/sidebar";
    import AppSidebar from "$lib/components/global/AppSidebar.svelte";
    import MobileDock from "$lib/components/global/MobileDock.svelte";

    let {children} = $props();
</script>

<Sidebar.Provider>
    <AppSidebar/>
    <main class="flex-1 overflow-auto min-h-0">
        {@render children?.()}
    </main>
    <MobileDock/>
</Sidebar.Provider>
