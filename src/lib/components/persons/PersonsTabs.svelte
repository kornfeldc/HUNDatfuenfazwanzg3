<script lang="ts">
    import {page} from '$app/stores';
    import {User, UserPlus} from "@lucide/svelte";

    // Personen and the online registrations are modules shown under the one "Personen" sidebar entry.
    const tabs = [
        {label: "Personen", href: "/l/modules/persons", icon: User},
        {label: "Anmeldungen", href: "/l/modules/registrations", icon: UserPlus},
    ];
</script>
<nav class="flex justify-center sm:justify-start px-3 mb-2">
    <div class="inline-flex gap-1 p-1 rounded-lg bg-muted">
        {#each tabs as tab}
            {@const active = $page.url.pathname.startsWith(tab.href)}
            <a href={tab.href} aria-current={active ? 'page' : undefined}
               class={"flex items-center gap-1.5 px-3 py-1 rounded-md text-sm transition-colors " +
                   (active ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}>
                <tab.icon size={16}/>
                {tab.label}
            </a>
        {/each}
    </div>
</nav>
