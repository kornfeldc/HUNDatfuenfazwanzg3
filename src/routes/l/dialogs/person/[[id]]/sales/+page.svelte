<script lang="ts">
    import { page } from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    let id = $page.params.id;

    let type = $derived($page.url.searchParams.get("type") ?? "all");

    const filterItems = [
        {id: "all", label: "Alles"},
        {id: "credit", label: "Guthaben aufgeladen"},
        {id: "sale", label: "Verkauf"},
    ];
</script>
<FilterBar items={filterItems} selected={type} parameterName="type" className="p-0! mt-2"></FilterBar>
