<script lang="ts">
    import logo from '$lib/assets/logo.svg'
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
    <div class="p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-200 dark:border-slate-700">
        <img src={logo} alt="Logo" class="mx-auto h-24 mb-8" />
        <h1 class="text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">Warte auf Freischaltung</h1>
        <p class="mb-10 text-slate-600 dark:text-slate-400">
            Ihr Benutzer muss erst für eine Ortsgruppe freigeschaltet werden.
        </p>
        
        <a 
            href="/logout"
            class="inline-block px-6 py-3 border border-slate-300 dark:border-slate-600 text-lg font-semibold rounded-xl text-slate-700 dark:text-white bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all shadow-sm"
        >
            Ausloggen 
        </a>
    </div>
</div>
