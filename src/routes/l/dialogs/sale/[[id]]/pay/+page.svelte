<script lang="ts">
    import {page} from '$app/stores';
    import type {ISale} from "$lib/data/hfzApi";
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import {Util} from "$lib/util";
    import {Minus, Plus} from "@lucide/svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import TextButton from "$lib/components/global/TextButton.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import {Checkbox} from "$lib/components/shadcn/ui/checkbox";
    import {Label} from "$lib/components/shadcn/ui/label";

    let id = $page.params.id;
    let {data}: { data: any; } = $props();

    let sale = $state({} as ISale);

    const loadData = async () => {
        sale = await data.sale;
    }

    const addOrRemove = (event: any, prop: string, amount: number) => {
        event.preventDefault();
        event.stopPropagation();

        (sale as any)[prop] += amount;

        // todo: calculate 
        return false;
    }
</script>
{#snippet label(label)}
    <div class="text-center items-end align-bottom self-end text-sm">{label}</div>
{/snippet}
{#snippet bigAmount(label, amount, className)}
    <div>
        <div class={Util.mapClass(`text-center text-3xl ${className}`, !amount, "text-muted-foreground/50")}>{Util.formatCurrency(amount, false)}</div>
    </div>
{/snippet}
{#snippet plusMinus(prop)}
    <div class="flex gap-2 justify-center items-center">
        <button onclick={(event) => addOrRemove(event, prop, -0.5)}>
            <Minus class="bg-destructive rounded-full text-destructive-foreground w-9 h-9 p-1.5"/>
        </button>
        <button onclick={(event) => addOrRemove(event, prop, 0.5)}>
            <Plus class="bg-ok rounded-full text-ok-foreground w-9 h-9 p-1.5"/>
        </button>
    </div>
{/snippet}
{#await loadData()}
    <Loading></Loading>
{:then _}
    <form method="post" action="/l/dialogs/sale/{id}">
        <Card className="max-w-xl m-auto">
            <PersonOverview person={sale.person}></PersonOverview>
        </Card>

        <Card className="max-w-xl m-auto">
            <div class="grid grid-cols-3 gap-y-2 pt-2">
                <div class="col-span-3 sm:px-12 flex items-center gap-2">
                    <Checkbox id="chkCredit" name="chk"></Checkbox>
                    <Label for="chkCredit">
                        Mit Guthaben zahlen
                    </Label>
                </div>
                <div class="col-span-3 border-b-[1px] border-b-muted pt-1 mb-1 "></div>

                {@render label("zu bezahlen")}
                {@render label("retour")}
                {@render label("neues Guth.")}

                {@render bigAmount("zu bezahlen", sale.toPay, "text-warning")}
                {@render bigAmount("retour", sale.toReturn, "")}
                {@render bigAmount("neues Guth.", 0, "")}

                <div class="col-span-3"></div>

                {@render label("ink. Trinkgeld")}
                {@render label("gegeben")}
                {@render label("Guth. aufladen")}

                {@render bigAmount("inkl. Tringgeld", sale.inclTip, "")}
                {@render bigAmount("gegeben", sale.given, "")}
                {@render bigAmount("Guth. aufladen", 0, "")}

                {@render plusMinus("inclTip")}
                {@render plusMinus("given")}
                {@render plusMinus("")}
            </div>
        </Card>

        <PlaceAtBottom>
            <BackButton></BackButton>
        </PlaceAtBottom>
        <NavigationActions>
            <div slot="actions">
                <button type="submit" name="redirectTo" value="/l/modules/sales">
                    <TextButton color="ok">Speichern</TextButton>
                </button>
            </div>
        </NavigationActions>
    </form>
{/await}
