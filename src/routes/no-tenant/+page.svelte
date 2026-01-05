<script lang="ts">
    import logo from '$lib/assets/logo.svg'
    import {Button} from "$lib/components/shadcn/ui/button";
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
    <div class="p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-200 dark:border-slate-700">
        <img alt="Logo" class="mx-auto h-24 mb-8" src={logo}/>
        <h1 class="text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">Warte auf Freischaltung</h1>
        <p class="mb-10 text-slate-600 dark:text-slate-400">
            Ihr Benutzer muss erst für eine Ortsgruppe freigeschaltet werden.
        </p>

        <Button
                class="bg-primary text-primary-foreground w-40"
                href="/"
        >
            Nochmal probieren
        </Button>

        <Button
                class="w-40"
                href="/logout"
                variant="outline"
        >
            Ausloggen
        </Button>
    </div>
</div>
