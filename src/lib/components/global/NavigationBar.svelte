<script lang="ts">
    import { page } from '$app/stores';
    import GlassBar from "./GlassBar.svelte";
    import GlassBarLink from "./GlassBarLink.svelte";
    import PlaceAtBottom from "./PlaceAtBottom.svelte";
    import {Euro, User, CalendarClock, ShoppingBag, PawPrint} from "@lucide/svelte";
    
    import {uiState} from "$lib/stores/uiState.svelte";

    let modules = $state([
        { name: "Verkäufe", href: "/l/modules/sales" },
        { name: "Kurse", href: "/l/modules/course" },
        { name: "Personen", href: "/l/modules/persons" },
        { name: "Artikel", href: "/l/modules/articles" },
        { name: "ROB", href: "/l/modules/rob" },
    ]);

    const isSelected = (href: string) => {
        const path = $page.url.pathname;
        return path === href || path.startsWith(href + '/');
    };
    
    const modulesWithoutNavigation = $state(["calendar"]);
    const isModuleWithoutNavigation = $derived(!!modulesWithoutNavigation.find(m => $page.url.pathname.endsWith(m)));
</script>

{#snippet renderIcon(href)}
    {#if href.toLowerCase().endsWith('sales')}
        <Euro />
    {:else if href.toLowerCase().endsWith('course') }
        <PawPrint />
    {:else if href.toLowerCase().endsWith('persons') }
        <User />
    {:else if href.toLowerCase().endsWith('articles') }
        <ShoppingBag />
    {:else if href.toLowerCase().endsWith('rob') }
        <CalendarClock />
    {/if}
{/snippet}

{#if uiState.showNavBar && !isModuleWithoutNavigation}
<PlaceAtBottom>
    <GlassBar>
        {#each modules as module}
            <GlassBarLink 
                    selected={isSelected(module.href)} 
                    href={module.href}>
                <div class="hidden sm:flex items-center gap-2">
                    {@render renderIcon(module.href)}
                    {module.name}
                </div> 
                <div class="flex items-center sm:hidden">
                    {@render renderIcon(module.href)}
                    {#if isSelected(module.href)}
                    {module.name}
                    {/if}
                </div>
            </GlassBarLink>
        {/each}
    </GlassBar>
</PlaceAtBottom>
{/if}