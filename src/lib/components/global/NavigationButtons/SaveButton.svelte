<script lang="ts">
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import { Save } from "@lucide/svelte";
    let {className = "", form = ""} = $props();
</script>
<PlaceAtBottom>
    <button type="submit" {form} class={"flex items-center justify-center w-[34px] h-[34px] rounded-full text-ok cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors " + className}>
        <Save class="w-7 h-7 shrink-0"/>
    </button>
</PlaceAtBottom>
