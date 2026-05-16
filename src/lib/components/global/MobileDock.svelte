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
    import { onMount } from "svelte";

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

    // Scroll-hide behavior
    let dockVisible = $state(true);
    let lastScrollY = $state(0);

    const handleScroll = (e?: Event) => {
        const target = e?.target as Element | null;
        const currentScrollY = target ? target.scrollTop : window.scrollY;
        if (currentScrollY < 10) {
            dockVisible = true;
        } else if (currentScrollY > lastScrollY + 8) {
            dockVisible = false;
        } else if (currentScrollY < lastScrollY - 8) {
            dockVisible = true;
        }
        lastScrollY = currentScrollY;
    };

    onMount(() => {
        const scrollEl = document.querySelector('main') ?? window;
        scrollEl.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollEl.removeEventListener('scroll', handleScroll);
    });

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

</script>

<!-- Mobile dock: shown only on small screens (md:hidden) -->
{#if isModulesPage || (isDialogsPage && hasActions)}
<div class="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-300 {dockVisible ? 'translate-y-0' : 'translate-y-full'}" style="padding-bottom: max(1rem, env(safe-area-inset-bottom))">
    <div class="pointer-events-auto">
        <Dock.Root class="bg-background/50! backdrop-blur-md shadow-lg">
            {#if isModulesPage}
                <!-- Sidebar toggle button — always leftmost -->
                <Dock.Icon onclick={() => sidebar.toggle()} class="text-foreground">
                    <PanelLeft class="w-8 h-8"/>
                </Dock.Icon>

                <Dock.Separator/>

                <!-- Main module nav icons: sales, course, persons, articles -->
                {#each mainModules as module}
                    <Dock.Icon
                        onclick={() => goto(module.href)}
                        class={isActive(module.href) ? 'text-primary' : 'text-foreground'}
                    >
                        <module.icon class="w-8 h-8"/>
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
                <!-- Dialog/special-page mode: show action buttons from store -->
                {#each dockActionsStore.actionsList as actionSnippet}
                    {@render actionSnippet()}
                {/each}
            {/if}
        </Dock.Root>
    </div>
</div>
{/if}
