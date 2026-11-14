<script lang="ts">
    import type {IAlbum} from "$lib/data/hfzApi";
    import AlbumGridEntry from "./AlbumGridEntry.svelte";
    import Grid from "$lib/components/global/Grid.svelte";

    interface IProps {
        albums: Array<IAlbum>;
    }

    let {albums}: IProps = $props();
</script>
<Grid>
    {#each albums as album (album.id)}
        <AlbumGridEntry {album}/>
    {/each}
</Grid>
