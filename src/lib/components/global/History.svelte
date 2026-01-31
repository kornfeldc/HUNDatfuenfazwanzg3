<script lang="ts">
    import type {IHistory} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Util, moment} from "$lib/util";
    import {User, Calendar, Activity, Info} from "@lucide/svelte";

    let {history}: { history: Array<IHistory> } = $props();

    const getActionLabel = (item: IHistory) => {
        const entityMap: Record<string, string> = {
            'person': 'Person',
            'sale': 'Verkauf',
            'article': 'Artikel'
        };
        const entity = entityMap[item.entityType] || item.entityType;

        switch (item.action) {
            case 'create': return `${entity} erstellt`;
            case 'update': return `${entity} bearbeitet`;
            case 'delete': return `${entity} gelöscht`;
            case 'pay_sale': return 'Verkauf bezahlt';
            case 'add_credit': {
                const amount = parseFloat(item.details);
                if (!isNaN(amount) && amount < 0) return 'Guthaben abgezogen';
                return 'Guthaben aufgeladen';
            }
            case 'add_course': {
                const amount = parseFloat(item.details);
                if (!isNaN(amount) && amount < 0) return 'Kurs abgezogen';
                return 'Kurs hinzugefügt';
            }
            default: return `${entity} ${item.action}`;
        }
    };

    const getActionColor = (item: IHistory) => {
        switch (item.action) {
            case 'create': return 'text-ok';
            case 'update': return 'text-primary';
            case 'delete': return 'text-destructive';
            case 'pay_sale': return 'text-ok';
            case 'add_credit': {
                const amount = parseFloat(item.details);
                if (!isNaN(amount) && amount < 0) return 'text-destructive';
                return 'text-ok';
            }
            case 'add_course': {
                const amount = parseFloat(item.details);
                if (!isNaN(amount) && amount < 0) return 'text-destructive';
                return 'text-ok';
            }
            default: return '';
        }
    };
</script>

<div class="flex flex-col gap-2">
    {#each history.filter(h => {
        if (h.action === 'add_credit' || h.action === 'add_course') {
            const amount = parseFloat(h.details);
            return !isNaN(amount) && amount !== 0;
        }
        return true;
    }) as item}
        <Card className="flex flex-col gap-1">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-2 font-bold {getActionColor(item)}">
                    <Activity size={16}/>
                    {getActionLabel(item)}
                </div>
                <div class="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={14}/>
                    {moment(item.timestamp).format("DD.MM.YYYY HH:mm")}
                </div>
            </div>

            {#if item.details}
                <div class="flex items-start gap-2 text-sm bg-accent/10 p-2 rounded">
                    <Info size={14} class="mt-1 flex-shrink-0 text-muted-foreground"/>
                    <span>{item.details}</span>
                </div>
            {/if}

            <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <User size={14}/>
                {item.userEmail}
            </div>
        </Card>
    {:else}
        <div class="text-center p-8 text-muted-foreground">
            Keine Historie gefunden.
        </div>
    {/each}
</div>
