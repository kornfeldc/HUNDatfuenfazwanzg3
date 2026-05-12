<script lang="ts">
    import { page } from '$app/stores';
    import * as Sidebar from "$lib/components/shadcn/ui/sidebar";
    import {
        Euro,
        User,
        CalendarClock,
        ShoppingBag,
        PawPrint,
        CalendarDays,
        BarChart2,
        History,
        LogOut,
    } from "@lucide/svelte";
    import Avatar from "$lib/components/global/Avatar.svelte";
    import logo from "$lib/assets/logo.svg";

    const sidebar = Sidebar.useSidebar();
    const closeIfMobile = () => { if (sidebar.isMobile) sidebar.setOpenMobile(false); };

    const modules = [
        { name: "Verkäufe", href: "/l/modules/sales", icon: Euro },
        { name: "Kurse", href: "/l/modules/course", icon: PawPrint },
        { name: "Personen", href: "/l/modules/persons", icon: User },
        { name: "Artikel", href: "/l/modules/articles", icon: ShoppingBag },
        { name: "ROB", href: "/l/modules/rob", icon: CalendarClock },
        { name: "Kalender", href: "/l/modules/calendar", icon: CalendarDays },
        { name: "Statistiken", href: "/l/modules/statistics", icon: BarChart2 },
        { name: "Historie", href: "/l/modules/history", icon: History },
    ];

    const isActive = (href: string) => {
        const path = $page.url.pathname;
        return path === href || path.startsWith(href + '/');
    };
</script>

<Sidebar.Root collapsible="icon" variant="floating">
    <Sidebar.Header class="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <a href="/l/modules" class="flex flex-col items-center gap-1 p-2 group-data-[collapsible=icon]:p-1">
            <img src={logo} alt="logo" class="w-10 h-10 shrink-0 group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:h-7">
            <span class="font-mono font-bold text-primary text-sm group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden text-center">
                <b class="font-extrabold">HUND</b><i class="font-light">atfuenfazwanzg</i>
            </span>
        </a>
    </Sidebar.Header>

    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each modules as module}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton
                                    class={isActive(module.href) ? 'bg-primary/10! text-primary font-medium' : ''}>
                                {#snippet child({props})}
                                    <a href={module.href} {...props} onclick={closeIfMobile}>
                                        <module.icon />
                                        <span>{module.name}</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>

    <Sidebar.Footer>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                    {#snippet child({props})}
                        <a href="/l/dialogs/user" {...props} onclick={closeIfMobile}>
                            <div class="w-5 h-5 shrink-0 flex items-center justify-center">
                                <Avatar size={5}/>
                            </div>
                            <span>Profil</span>
                        </a>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                    {#snippet child({props})}
                        <a href="/logout" {...props} onclick={closeIfMobile}>
                            <LogOut />
                            <span>Abmelden</span>
                        </a>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Footer>
</Sidebar.Root>
