<script lang="ts">
    import {Util} from "$lib/util";
    import {uiState} from "$lib/stores/uiState.svelte";
    
    let bottomClass = $derived.by(()=> {
        if(uiState.isSearchInputFocusedMobile) 
            return "fixed bottom-50";
        return "fixed bottom-0";
    });

    let {children, at = 'left'} = $props();
</script>
<div class={Util.mapClass(`${bottomClass} p-3 flex gap-2`, at === 'left', "left-0", "right-0")}>
    {@render children?.()}
</div>
