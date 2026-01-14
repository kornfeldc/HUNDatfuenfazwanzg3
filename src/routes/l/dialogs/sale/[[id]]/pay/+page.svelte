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
    let useCredit = $state(false);
    let personCredit = $derived(sale.person?.credit ?? 0);

    let toPay = $derived.by(() => {
        let val = 0;
        if (useCredit && personCredit >= sale.articleSum)
            val = 0;
        else if (useCredit)
            val = sale.articleSum - personCredit;
        else
            val = sale.articleSum;

        return Math.round(val * 10) / 10;
    });

    let baseToReturn = $derived(sale.given - sale.inclTip);
    let toReturn = $derived(baseToReturn - sale.addAdditionalCredit);
    let allowPay = $derived(sale.given >= toPay);

    let isCreditPaymentAvailable = $derived(() => sale.person?.credit > 0);

    const loadData = async () => {
        sale = await data.sale;
        recalculate("initial");
    }

    const addOrRemove = (event: any, prop: string, amount: number) => {
        event.preventDefault();
        event.stopPropagation();

        (sale as any)[prop] += amount;

        console.log("prop", prop);
        if (prop === "given" || prop === "inclTip")
            recalculate(prop);
        return false;
    }

    const recalculate = (mode: "initial" | "given" | "inclTip") => {
        if (mode === "initial") {
            sale.inclTip = toPay;
            sale.given = toPay;
            sale.addAdditionalCredit = 0.0;

            // if(app.$route.query && app.$route.query.jc && app.$route.query.jc > 0)
            //     app.sale.addAdditionalCredit = app.sale.given = parseFloat(app.$route.query.jc);
        }

        if (sale.inclTip < toPay)
            sale.inclTip = toPay;

        if (mode === "inclTip" && sale.given < sale.inclTip)
            sale.given = sale.inclTip;
        if (mode === "given" && sale.given < sale.inclTip)
            sale.inclTip = sale.given;
        
        if(sale.given < toPay) { 
            sale.given = toPay;
            recalculate("given");
        }

        if (mode === "given" || mode === "inclTip") {
            if (toReturn < 0)
                sale.addAdditionalCredit = 0;
        }
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
    <form method="post" action={`/l/dialogs/sale/${id ?? ''}/pay`}>
        <input type="hidden" name="given" value={sale.given} />
        <input type="hidden" name="inclTip" value={sale.inclTip} />
        <input type="hidden" name="addAdditionalCredit" value={sale.addAdditionalCredit} />
        <input type="hidden" name="toPay" value={toPay} />
        <input type="hidden" name="usedCredit" value={useCredit} />

        <Card className="max-w-xl m-auto">
            {#if sale.person}
                <PersonOverview person={sale.person}></PersonOverview>
            {:else}
                <p class="text-xl text-center">Barverkauf</p>
            {/if}
        </Card>

        <Card className="max-w-xl m-auto">
            {#if isCreditPaymentAvailable()}
                <div class="grid grid-cols-3 gap-y-2 pt-2">
                    <div class="col-span-3 sm:px-12 flex items-center gap-2">
                        <Checkbox id="chkCredit" name="chk" bind:checked={useCredit}></Checkbox>
                        <Label for="chkCredit">
                            Mit Guthaben zahlen
                        </Label>
                    </div>
                    <div class="col-span-3 border-b-[1px] border-b-muted pt-1 mb-1 "></div>

                    {@render label("zu bezahlen")}
                    {@render label("retour")}
                    {@render label("neues Guth.")}

                    {@render bigAmount("zu bezahlen", toPay, "text-warning")}
                    {@render bigAmount("retour", toReturn, "text-destructive")}
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
            {:else}
                <div class="grid grid-cols-2 gap-y-2 pt-2">
                    {@render label("zu bezahlen")}
                    {@render label("retour")}

                    {@render bigAmount("zu bezahlen", toPay, "text-warning")}
                    {@render bigAmount("retour", toReturn, "text-destructive")}

                    <div class="col-span-2"></div>

                    {@render label("ink. Trinkgeld")}
                    {@render label("gegeben")}

                    {@render bigAmount("inkl. Tringgeld", sale.inclTip, "")}
                    {@render bigAmount("gegeben", sale.given, "")}

                    {@render plusMinus("inclTip")}
                    {@render plusMinus("given")}
                </div>
            {/if}
        </Card>

        <PlaceAtBottom>
            <BackButton></BackButton>
        </PlaceAtBottom>
        <NavigationActions>
            <div slot="actions">
                <button type="submit" name="redirectTo" value="/l/modules/sales">
                    <TextButton color="ok">Fertig</TextButton>
                </button>
            </div>
        </NavigationActions>
    </form>
{/await}
