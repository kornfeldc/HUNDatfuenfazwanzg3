<script lang="ts">
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import { uiState } from "$lib/stores/uiState.svelte";
</script>

<PlaceAtBottom at="right">
    <slot name="persistent" />
    {#if uiState.showActions}
        <slot name="actions" />
    {/if}
</PlaceAtBottom>