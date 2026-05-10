<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import {
        Euro,
        User,
        CalendarClock,
        ShoppingBag,
        PawPrint,
        PanelLeft,
    } from "@lucide/svelte";
    // noinspection ES6UnusedImports
    import * as Dock from "$lib/components/shadcn/ui/dock";
    import * as Sidebar from "$lib/components/shadcn/ui/sidebar";
    import { dockActionsStore } from "$lib/stores/dockActionsStore.svelte";

    // Only the four main nav modules shown in the dock
    const mainModules = [
        { name: "Verkäufe", href: "/l/modules/sales", icon: Euro },
        { name: "Kurse", href: "/l/modules/course", icon: PawPrint },
        { name: "Personen", href: "/l/modules/persons", icon: User },
        { name: "Artikel", href: "/l/modules/articles", icon: ShoppingBag },
    ];

    const isActive = (href: string) => {
        const path = $page.url.pathname;
        return path === href || path.startsWith(href + '/');
    };

    const sidebar = Sidebar.useSidebar();

    // personChooser shows action-only dock
    const isPersonChooserPage = $derived($page.url.pathname.startsWith('/l/modules/personChooser'));
    // All /modules/ pages (except personChooser) show the main nav dock
    const isModulesPage = $derived(
        $page.url.pathname.startsWith('/l/modules') && !isPersonChooserPage
    );
    // /dialogs/ pages and personChooser show action-only dock
    const isDialogsPage = $derived(
        $page.url.pathname.startsWith('/l/dialogs') || isPersonChooserPage
    );
    const hasActions = $derived(dockActionsStore.actionsList.length > 0);

    // Set renderingInDock flag so GlassCircle renders in dock-compact mode
    $effect(() => {
        const active = hasActions;
        dockActionsStore.renderingInDock = active;
        return () => { dockActionsStore.renderingInDock = false; };
    });
</script>

<!-- Mobile dock: shown only on small screens (md:hidden) -->
{#if isModulesPage || (isDialogsPage && hasActions)}
<div class="md:hidden fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
    <div class="pointer-events-auto">
        <Dock.Root class="bg-background/50! backdrop-blur-md shadow-lg">
            {#if isModulesPage}
                <!-- Sidebar toggle button — always leftmost -->
                <Dock.Icon onclick={() => sidebar.toggle()} class="text-foreground">
                    <PanelLeft class="w-5 h-5"/>
                </Dock.Icon>

                <Dock.Separator/>

                <!-- Main module nav icons: sales, course, persons, articles -->
                {#each mainModules as module}
                    <Dock.Icon
                        onclick={() => goto(module.href)}
                        class={isActive(module.href) ? 'text-primary' : 'text-foreground'}
                    >
                        <module.icon class="w-5 h-5"/>
                    </Dock.Icon>
                {/each}

                {#if hasActions}
                    <Dock.Separator/>
                    <!-- Module-specific action button (e.g. AddButton) — always rightmost -->
                    {#each dockActionsStore.actionsList as actionSnippet}
                        {@render actionSnippet()}
                    {/each}
                {/if}
            {:else if isDialogsPage && hasActions}
                <!-- Dialog/special-page mode: show action buttons from PlaceAtBottom -->
                <div class="flex items-center gap-1 px-1">
                    {#each dockActionsStore.actionsList as actionSnippet}
                        {@render actionSnippet()}
                    {/each}
                </div>
            {/if}
        </Dock.Root>
    </div>
</div>
{/if}
