<script lang="ts">
    import {CircleX} from "@lucide/svelte";
    import GlassBar from "$lib/components/global/GlassBar.svelte";
    
    interface IProps {
        value?: any;
    }
    
    let {
        value = $bindable("")
    }: IProps = $props();

    const clearSearch = (event) => {
        event.stopPropagation();
        event.preventDefault();
        startSearch("");
        return false;
    }
    const startSearch = (val: string) => {
        value = val;
    }
</script>

<GlassBar>
    <input
            style="width: calc(100vw - 9em)"
            class="border-0 m-0 p-1.5 bg-transparent rounded-full mr-1 text-white placeholder-gray-200"
            type="text"
            placeholder="Suche"
            bind:value={value}
            oninput={(e) => startSearch(e.currentTarget.value)}/>
    <button onclick={(event) => clearSearch(event)} class="pr-2 text-gray-200">
        <CircleX/>
    </button>
</GlassBar>
    
