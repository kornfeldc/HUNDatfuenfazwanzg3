<script lang="ts">
    import { page } from '$app/stores';
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import Pill from "$lib/components/global/Pill.svelte";
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    let id = $page.params.id;
</script>

