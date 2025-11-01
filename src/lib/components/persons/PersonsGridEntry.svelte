<script lang="ts">
    import type {IPerson} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Bone, Star} from "@lucide/svelte";
    import {Util, rememberOrigin} from "$lib/util";

    interface IProps {
        person: IPerson;
    }

    let {person}: IProps = $props();
</script>
<a use:rememberOrigin href={`/l/dialogs/person/${person.id}`}>
    <Card>
        <div class="flex">
            <div class="font-bold text-lg w-full">
                {person.lastName} {person.firstName}
            </div>
            {#if person.isMember}
                <div>
                    <Star size="16" class="text-accent"></Star>
                </div>
            {/if}
        </div>
        <div class="flex items-center">
            <div class="text-muted-foreground text-md flex items-center w-full">
                {#if person.dogNames}
                    <Bone size="16"></Bone>&nbsp;{person.dogNames}
                {/if}
            </div>
            <div class="whitespace-nowrap text-sm text-ok">
                {#if person.credit}
                    {Util.formatCurrency(person.credit)}
                {:else}
                    &nbsp;
                {/if}
            </div>
        </div>
    </Card>
</a>