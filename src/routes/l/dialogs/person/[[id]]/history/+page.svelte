<script lang="ts">
    import { page } from '$app/stores';
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    let id = $page.params.id;

    let type = $derived($page.url.searchParams.get("type") ?? "all");

    const filterItems = [
        {id: "all", label: "Alles"},
        {id: "sale", label: "Verkauf"},
        {id: "course", label: "Kurs"},
        {id: "credit", label: "Guthaben aufgeladen"},
    ];
</script>
<FilterBar items={filterItems} selected={type} parameterName="type" className="p-0! mt-2"></FilterBar>
