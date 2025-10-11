<script lang="ts">
    import type {IArticle} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Heart} from "@lucide/svelte";
    import {Util} from "$lib/util";

    interface IProps {
        article: IArticle;
    }

    let {article}: IProps = $props();
</script>
<Card>
    <div class="flex">
        <div class="font-bold text-lg w-full">
            {article.title}
        </div>
        {#if article.isFavorite}
            <div>
                <Heart size="16" class="text-rose-600"></Heart>
            </div>
        {/if}
    </div>
    <div class="flex items-center">
        <div class="text-muted-foreground text-md flex items-center w-full">
            {#if article.type}
<!--                <Bone size="16"></Bone>&nbsp;{person.dogNames}-->
                {article.type}
            {/if}
        </div>
        <div class="whitespace-nowrap text-sm ">
            {Util.formatCurrency(article.price)}
        </div>
    </div>
</Card>