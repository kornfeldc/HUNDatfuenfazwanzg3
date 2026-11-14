<script lang="ts">
    import type {IAlbum} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Util} from "$lib/util";
    import {EyeOff, Image} from "@lucide/svelte";

    interface IProps {
        album: IAlbum;
    }

    let {album}: IProps = $props();
</script>
<a href={`/l/dialogs/album/${album.id}`}>
    <Card>
        <div class="flex items-center gap-3">
            <div class="w-20 aspect-[4/3] shrink-0 rounded-md overflow-hidden bg-muted grid place-items-center text-muted-foreground">
                {#if album.coverUrl}
                    <img src={album.coverUrl} alt="" loading="lazy" referrerpolicy="no-referrer" class="w-full h-full object-cover"/>
                {:else}
                    <Image size="20"/>
                {/if}
            </div>
            <div class="min-w-0 w-full">
                <div class="flex items-center gap-2">
                    <div class="font-bold text-lg w-full truncate">
                        {album.title}
                    </div>
                    {#if !album.isPublished}
                        <div class="flex items-center gap-1 whitespace-nowrap text-sm text-warning">
                            <EyeOff size="16"></EyeOff>
                            Entwurf
                        </div>
                    {/if}
                </div>
                <div class="text-muted-foreground text-sm">
                    {album.dateText || Util.formatDate(album.date)}
                </div>
            </div>
        </div>
    </Card>
</a>
