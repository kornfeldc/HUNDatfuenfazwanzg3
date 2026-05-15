<script lang="ts">
    import {Plus} from "@lucide/svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import {goto} from "$app/navigation";

    let {href = "", className = ""} = $props();
</script>
<PlaceAtBottom>
    {#if href}
        <a {href} class={"flex items-center justify-center w-[34px] h-[34px] rounded-full text-primary hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors " + className}>
            <Plus class="w-7 h-7"/>
        </a>
    {:else}
        <span class={"flex items-center justify-center w-[34px] h-[34px] rounded-full text-primary hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors " + className}>
            <Plus class="w-7 h-7"/>
        </span>
    {/if}
</PlaceAtBottom>
