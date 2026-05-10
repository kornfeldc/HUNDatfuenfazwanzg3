<script lang="ts">
    import {ArrowLeft} from "@lucide/svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import {goto} from "$app/navigation";

    let {href = "", className = ""} = $props();

    const onclick = (event: any) => {
        event.stopPropagation();
        event.preventDefault();

        const lastModule = uiState.getLastRouteSmart();
        if(lastModule) {
            goto(lastModule);
            return false;
        }

        history.back();
        return false;
    }
</script>
<PlaceAtBottom>
    {#if href}
        <a {href} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-foreground hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ArrowLeft class="w-6 h-6"/>
        </a>
    {:else}
        <button {onclick} class="flex items-center justify-center w-[34px] h-[34px] rounded-full text-foreground cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ArrowLeft class="w-6 h-6"/>
        </button>
    {/if}
</PlaceAtBottom>
