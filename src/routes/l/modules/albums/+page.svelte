<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import AlbumGrid from "$lib/components/albums/AlbumGrid.svelte";
    import AddButton from "$lib/components/global/NavigationButtons/AddButton.svelte";
    import type {IAlbum} from "$lib/data/hfzApi";
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import {uiState} from "$lib/stores/uiState.svelte";
    import {page} from '$app/stores';

    let {data}: { data: any } = $props();
    let type = $derived($page.url.searchParams.get("type") ?? "all");

    // Already sorted newest first by the API
    const filter = (albums: Array<IAlbum>) => {
        const search = uiState.searchString.toLowerCase();
        return albums.filter((a: IAlbum) =>
            (a.title?.toLowerCase().includes(search) || a.dateText?.toLowerCase().includes(search)) &&
            (
                type === "all" ||
                (type === "published" && a.isPublished) ||
                (type === "draft" && !a.isPublished)
            )
        );
    }

    const filterItems = [
        {id: "all", label: "Alle"},
        {id: "published", label: "Veröffentlicht"},
        {id: "draft", label: "Entwürfe"},
    ];
</script>
{#await data.albums}
    <Loading></Loading>
{:then albums}
    <FilterBar className="px-3 mb-2" items={filterItems} selected={type} parameterName="type"></FilterBar>
    <AlbumGrid albums={filter(albums)}/>
{/await}

<AddButton href="/l/dialogs/album"></AddButton>
