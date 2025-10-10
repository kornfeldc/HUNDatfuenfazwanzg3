<script lang="ts">
    import { page } from '$app/stores';

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

<div class="pos-fixed-bottom">
    <div class="glass-bar">
        {#each modules as module}
            <a class={(isSelected(module.href) ? "selected" : "") + " item"} href={module.href}>{module.name}</a>
        {/each}
    </div>
</div>