<script lang="ts">
    import { page } from '$app/stores';
    import * as Breadcrumb from '$lib/components/shadcn/ui/breadcrumb';
    import { breadcrumbStore } from '$lib/stores/breadcrumbStore.svelte';

    type ModuleInfo = { label: string; href: string };

    const moduleMap: Record<string, ModuleInfo> = {
        sales:         { label: 'Verkäufe',  href: '/l/modules/sales' },
        articles:      { label: 'Artikel',   href: '/l/modules/articles' },
        persons:       { label: 'Personen',  href: '/l/modules/persons' },
        course:        { label: 'Kurse',     href: '/l/modules/course' },
        rob:           { label: 'Rob',       href: '/l/modules/rob' },
        calendar:      { label: 'Kalender',  href: '/l/modules/calendar' },
        statistics:    { label: 'Statistik', href: '/l/modules/statistics' },
        personChooser: { label: 'Personen',  href: '/l/modules/personChooser' },
        // dialogs
        sale:    { label: 'Verkäufe',  href: '/l/modules/sales' },
        article: { label: 'Artikel',   href: '/l/modules/articles' },
        person:  { label: 'Personen',  href: '/l/modules/persons' },
        user:    { label: 'Profil',    href: '/l/modules/persons' },
        history: { label: 'Verlauf',   href: '/l/modules/sales' },
    };

    const info = $derived.by((): { module: ModuleInfo | null; isModule: boolean } => {
        const pathname = $page.url.pathname;
        const parts = pathname.split('/').filter(Boolean);
        // parts[0] = 'l', parts[1] = 'modules'|'dialogs', parts[2] = module name
        const section = parts[1];
        const name = parts[2];
        if (!name) return { module: null, isModule: false };
        const mod = moduleMap[name] ?? null;
        return { module: mod, isModule: section === 'modules' };
    });

    const detailLabel = $derived(breadcrumbStore.detailLabel);
</script>

<!-- Mobile only breadcrumb: shown above content -->
<div class="md:hidden px-4 pt-3 pb-1 flex justify-center">
    {#if info.module}
        <Breadcrumb.Root>
            <Breadcrumb.List class="text-sm flex-nowrap justify-center">
                {#if info.isModule}
                    <!-- Module page: just show the module name -->
                    <Breadcrumb.Item>
                        <Breadcrumb.Page class="font-medium text-primary">
                            {info.module.label}
                        </Breadcrumb.Page>
                    </Breadcrumb.Item>
                {:else}
                    <!-- Dialog page: Module > Detail -->
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href={info.module.href} class="text-muted-foreground hover:text-foreground">
                            {info.module.label}
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                    {#if detailLabel}
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Page class="font-medium text-primary truncate max-w-48">
                                {detailLabel}
                            </Breadcrumb.Page>
                        </Breadcrumb.Item>
                    {/if}
                {/if}
            </Breadcrumb.List>
        </Breadcrumb.Root>
    {/if}
</div>
