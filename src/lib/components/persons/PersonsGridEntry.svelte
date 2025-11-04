<script lang="ts">
    import type {IPerson} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Bone, Star} from "@lucide/svelte";
    import {Util} from "$lib/util";

    interface IProps {
        person: IPerson;
        href?: string;
    }

    let {person,href = ""}: IProps = $props();
    
    let linkTo = $derived.by(() => {
       if(href)
           return `${href}?personId=${person.id}`;
       return "/l/dialogs/person/"+person.id;
    });
    
</script>
<a href={linkTo}>
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