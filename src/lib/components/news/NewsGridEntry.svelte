<script lang="ts">
    import type {INews} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Util} from "$lib/util";
    import {EyeOff} from "@lucide/svelte";

    interface IProps {
        entry: INews;
    }

    let {entry}: IProps = $props();
</script>
<a href={`/l/dialogs/news/${entry.id}`}>
    <Card>
        <div class="flex items-center gap-2">
            <div class="font-bold text-lg w-full">
                {entry.title}
            </div>
            {#if !entry.isPublished}
                <div class="flex items-center gap-1 whitespace-nowrap text-sm text-warning">
                    <EyeOff size="16"></EyeOff>
                    Entwurf
                </div>
            {/if}
        </div>
        <div class="text-muted-foreground text-sm">
            {Util.formatDate(entry.date)}
        </div>
        <div class="text-sm line-clamp-3 mt-1">
            {entry.content}
        </div>
    </Card>
</a>
