<script lang="ts">
    import type {IPerson} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Bone, Star} from "@lucide/svelte";
    import {Util} from "$lib/util";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import {enhance} from "$app/forms";
    import {goto} from "$app/navigation";

    interface IProps {
        person: IPerson;
        href?: string;
        group?: "active" | "today" | "inactive";
        onSubmitting?: (val: boolean) => void;
    }

    let {person, href = "", group = "active", onSubmitting}: IProps = $props();

    let linkTo = $derived.by(() => {
        if (href)
            return `${href}?personId=${person.id}`;
        return "/l/dialogs/person/" + person.id + "/history?type=course";
    });

</script>
<div onclick={() => goto(linkTo)} class="cursor-pointer">
    <Card className={"" + ( group == "inactive" ? "text-muted-foreground" : group === "today" ? "bg-primary/20" : "" )}>
        <div class="flex items-center gap-2">
            <div class="flex flex-col grow pt-2 ">
                <div class="flex items-center gap-2 font-bold text-lg w-full">
                    {person.lastName} {person.firstName}
                    {#if person.isMember}
                        <div>
                            <Star size="16" class="text-accent"></Star>
                        </div>
                    {/if}
                </div>
                {#if person.dogNames}
                    <div class="text-muted-foreground text-md flex items-center w-full">
                        <Bone size="16"></Bone>&nbsp;{person.dogNames}
                    </div>
                {/if}
                {#if person.courseCount}
                    <div class="whitespace-nowrap">
                        Einheit(en) frei:
                        <span class="text-primary text-lg">{Util.formatCurrency(person.courseCount, false, 0)}</span>
                    </div>
                {/if}
            </div>
            <div onclick={(e) => e.stopPropagation()}>
                {#if person.courseCount > 0}
                    <form method="POST" action="?/deduct" use:enhance={() => {
                        onSubmitting?.(true);
                        return async ({update}) => {
                            await update();
                            onSubmitting?.(false);
                        };
                    }}>
                        <input type="hidden" name="personId" value={person.id}/>
                        <button type="submit">
                            <GlassCircleLink
                                    className="whitespace-nowrap mt-1 w-min text-sm bg-background border-2 border-primary! text-primary!">
                                Einheit abziehen
                            </GlassCircleLink>
                        </button>
                    </form>
                {/if}
            </div>
        </div>
    </Card>
</div>