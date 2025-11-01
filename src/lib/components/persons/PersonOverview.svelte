<script lang="ts">
    import type {IPerson} from "$lib/data/hfzApi";
    import {Util, rememberOrigin} from "$lib/util";

    interface IProps {
        person: IPerson;
    }

    const {person}: IProps = $props();
</script>
{#snippet amount(amount, currency, decimals, label)}
    {#if amount > 0}
        {label}: <span class="text-primary text-lg text-bold">{Util.formatCurrency(amount, currency, decimals)}</span>
    {/if}
{/snippet}
<a use:rememberOrigin href={`/l/dialogs/person/${person.id}`}>
    <div class="grid grid-cols-2 gap-1">
        <div class="text-xl text-bold">
            {person.lastName} {person.firstName}
        </div>
        <div class="text-right text-sm">
            {@render amount(person.credit, true, 2, "Guthaben")}
        </div>
        <div class="text-sm text-muted-foreground">
            {#if person.dogNames}
                ({person.dogNames})
            {/if}
        </div>
        <div class="text-right text-sm">
            {@render amount(person.courseCount, false, 0, "Einheit(en) frei")}
        </div>
    </div>
</a>
