<script lang="ts">
    import { page } from '$app/stores';
    import GlassBar from "./GlassBar.svelte";
    import GlassBarLink from "./GlassBarLink.svelte";
    import PlaceAtBottom from "./PlaceAtBottom.svelte";

    let modules = $state([
        { name: "Verkauf", href: "/l/modules/sales" },
        { name: "Kurs", href: "/l/modules/courses" },
        { name: "ROB", href: "/l/modules/rob" },
        { name: "Personen", href: "/l/modules/persons" },
        { name: "Artikel", href: "/l/modules/articles" },
    ]);

    const isSelected = (href: string) => {
        const path = $page.url.pathname;
        return path === href || path.startsWith(href + '/');
    };
</script>

<PlaceAtBottom>
    <GlassBar>
        {#each modules as module}
            <GlassBarLink selected={isSelected(module.href)} href={module.href}>{module.name}</GlassBarLink>
        {/each}
    </GlassBar>
</PlaceAtBottom>