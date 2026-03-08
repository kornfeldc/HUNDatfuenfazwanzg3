<script lang="ts">
import logo from "$lib/assets/logo.svg";
import Avatar from "$lib/components/global/Avatar.svelte";
import { page } from '$app/stores';

const modules = [
    { name: "Verkäufe", href: "/l/modules/sales" },
    { name: "Kurse", href: "/l/modules/course" },
    { name: "Personen", href: "/l/modules/persons" },
    { name: "Artikel", href: "/l/modules/articles" },
    { name: "ROB", href: "/l/modules/rob" },
    { name: "Kalender", href: "/l/modules/calendar" },
    { name: "Statistiken", href: "/l/modules/statistics" },
];

const dialogs = [
    { name: "Verkauf", pattern: "/l/dialogs/sale" },
    { name: "Person", pattern: "/l/dialogs/person" },
    { name: "Artikel", pattern: "/l/dialogs/article" },
    { name: "ROB", pattern: "/l/dialogs/rob" },
];

const currentModule = $derived(
    modules.find(m => $page.url.pathname === m.href || $page.url.pathname.startsWith(m.href + '/'))
    ?? dialogs.find(d => $page.url.pathname === d.pattern || $page.url.pathname.startsWith(d.pattern + '/'))
);
</script>

<div class="flex p-2 sm:p-4 w-full shadow-xl shadow-primary/10 mb-2 sm:mb-4 items-center gap-4 ">
    <a href="/l/modules">
        <img src={logo} alt="logo" class="w-10 h-10">
    </a>
    <a href="/l/modules" class="w-full text-center">
        <div class="hidden sm:block text-primary text-3xl font-mono"><b class="font-extrabold">HUND</b><i>atfuenfazwanzg</i></div>
        <div class="sm:hidden text-primary text-xl font-semibold">{currentModule?.name ?? 'HUND'}</div>
    </a> 
    <a href="/l/dialogs/user" class="w-14">
        <Avatar/>
    </a>
</div>
