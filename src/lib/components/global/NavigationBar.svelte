<script lang="ts">
    import { page } from '$app/stores';
    import GlassBar from "./GlassBar.svelte";
    import GlassBarLink from "./GlassBarLink.svelte";
    import PlaceAtBottom from "./PlaceAtBottom.svelte";
    
    import {uiState} from "$lib/stores/uiState.svelte";

    let modules = $state([
        { name: "Verkauf", href: "/l/modules/sales" },
        { name: "Personen", href: "/l/modules/persons" },
        { name: "Artikel", href: "/l/modules/articles" },
        { name: "ROB", href: "/l/modules/rob" },
    ]);

    const isSelected = (href: string) => {
        const path = $page.url.pathname;
        return path === href || path.startsWith(href + '/');
    };
</script>

{#if uiState.showNavBar}
<PlaceAtBottom>
    <GlassBar>
        {#each modules as module}
            <GlassBarLink selected={isSelected(module.href)} href={module.href}>{module.name}</GlassBarLink>
        {/each}
    </GlassBar>
</PlaceAtBottom>
{/if}