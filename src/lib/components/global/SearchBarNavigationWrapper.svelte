<script lang="ts">
    import SearchBar from "$lib/components/global/SearchBar.svelte";
    
    let {
        value = $bindable(""),
        onEnter = undefined,
        onClear = undefined,
    } : {
        onEnter?: () => void;
        onClear?: (wasEmptyBefore: boolean) => void;
        value?: any;
    }  = $props();
</script>
<SearchBar bind:value={value} {onEnter} {onClear}/>