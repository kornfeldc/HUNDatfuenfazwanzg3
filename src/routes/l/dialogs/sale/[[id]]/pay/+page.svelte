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
    import EditableAmount from "$lib/components/global/EditableAmount.svelte";
    import {untrack} from "svelte";
    import { enhance } from '$app/forms';

    let id = $page.params.id;
    let {data}: { data: any; } = $props();

    let sale = $state({} as ISale);
    let useCredit = $state(false);
    let submitting = $state(false);
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
    let oldCredit = $derived(Math.round((sale.person?.credit ?? 0) * 100) / 100);
    let newCredit = $derived.by(() => {
        if (!sale.person)
            return 0;

        let ret = personCredit;
        if (useCredit)
            ret -= Math.min(personCredit, sale.articleSum);
        ret += sale.addAdditionalCredit;
        return Math.round(ret * 10) / 10;
    });

    let isCreditManagementAvailable = $derived(() => !!sale.person);
    let isCreditPaymentAvailable = $derived(() => sale.person?.credit > 0);

    const loadData = async () => {
        sale = await data.sale;
        if (personCredit >= sale.articleSum)
            useCredit = true;
        recalculate("initial");
    }

    const addOrRemove = (event: any, prop: string, amount: number) => {
        event.preventDefault();
        event.stopPropagation();

        (sale as any)[prop] += amount;
        (sale as any)[prop] = Math.round((sale as any)[prop] * 2) / 2;

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

        if (sale.given < toPay) {
            sale.given = toPay;
            recalculate("given");
        }

        if (mode === "given" || mode === "inclTip") {
            if (toReturn < 0)
                sale.addAdditionalCredit = 0;
        }
    }

    $effect(() => {
        useCredit;
        untrack(() => {
            sale.addAdditionalCredit = 0;
            sale.inclTip = sale.articleSum;
            sale.given = sale.articleSum;
            sale.addAdditionalCredit = 0;
            recalculate("initial");
        });
    });
</script>
{#snippet label(label)}
    <div class="text-center items-end align-bottom self-end text-sm">{label}</div>
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
{#snippet articles(colspan = 3)}
    <div class={"col-span-"+colspan + " w-full flex"}>
        <div class="flex-grow text-muted-foreground">
            {sale.saleArticles.map(sa => `${sa.amount}x ${sa.articleTitle}`).join(", ")}
        </div>
        <div class="font-bold text-xl text-foreground whitespace-nowrap">{Util.formatCurrency(sale.articleSum, true)}</div>
    </div>

    <div class={"col-span-"+colspan+" border-b-[1px] border-b-muted pt-1 mb-1 "}></div>
{/snippet}
{#await loadData()}
    <Loading></Loading>
{:then _}
    <form method="post" action={`/l/dialogs/sale/${id ?? ''}/pay`} use:enhance={() => {
        submitting = true;
        return async ({ update }) => {
            await update();
            submitting = false;
        };
    }}>
        <input type="hidden" name="given" value={sale.given}/>
        <input type="hidden" name="inclTip" value={sale.inclTip}/>
        <input type="hidden" name="toReturn" value={toReturn}/>
        <input type="hidden" name="addAdditionalCredit" value={sale.addAdditionalCredit}/>
        <input type="hidden" name="toPay" value={toPay}/>
        <input type="hidden" name="usedCredit" value={useCredit}/>
        <input type="hidden" name="oldCredit" value={oldCredit}/>
        <input type="hidden" name="newCredit" value={newCredit}/>
        <input type="hidden" name="personId" value={sale.person?.id ?? ''}/>

        <Card className="max-w-xl m-auto">
            {#if sale.person}
                <PersonOverview person={sale.person}></PersonOverview>
            {:else}
                <p class="text-xl text-center">Barverkauf</p>
            {/if}
        </Card>


        <Card className="max-w-xl m-auto">
            {#if isCreditManagementAvailable()}
                <div class="grid grid-cols-3 gap-y-2 pt-2">
                    {@render articles()}

                    {#if isCreditPaymentAvailable()}
                        <div class="col-span-3 sm:px-12 flex items-center gap-2 pl-1">
                            <Checkbox id="chkCredit" name="chk" bind:checked={useCredit}></Checkbox>
                            <Label for="chkCredit">
                                Mit Guthaben zahlen
                            </Label>
                        </div>
                        <div class="col-span-3 border-b-[1px] border-b-muted pt-1 mb-1 "></div>
                    {/if}

                    {@render label("zu bezahlen")}
                    {@render label("retour")}
                    {@render label("neues Guth.")}

                    <EditableAmount value={toPay} className={useCredit ? "text-ok" : "text-warning"} readonly={true}/>
                    <EditableAmount value={toReturn} className="text-destructive" readonly={true}/>
                    <EditableAmount value={newCredit} className={newCredit < personCredit ? "" : "text-primary"}
                                    readonly={true}/>

                    <div class="col-span-3"></div>

                    {@render label("ink. Trinkgeld")}
                    {@render label("gegeben")}
                    {@render label("Guth. aufladen")}

                    <EditableAmount bind:value={sale.inclTip} className="" onCommit={() => recalculate("inclTip")}/>
                    <EditableAmount bind:value={sale.given} className="" onCommit={() => recalculate("given")}/>
                    <EditableAmount bind:value={sale.addAdditionalCredit} className=""/>

                    {@render plusMinus("inclTip")}
                    {@render plusMinus("given")}
                    {@render plusMinus("addAdditionalCredit")}
                </div>
            {:else}
                <div class="grid grid-cols-2 gap-y-2 pt-2">
                    {@render articles(2)}

                    {@render label("zu bezahlen")}
                    {@render label("retour")}

                    <EditableAmount value={toPay} className="text-warning" readonly={true}/>
                    <EditableAmount value={toReturn} className="text-destructive" readonly={true}/>

                    <div class="col-span-2"></div>

                    {@render label("inkl. Trinkgeld")}
                    {@render label("gegeben")}

                    <EditableAmount bind:value={sale.inclTip} className="" onCommit={() => recalculate("inclTip")}/>
                    <EditableAmount bind:value={sale.given} className="" onCommit={() => recalculate("given")}/>

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
                {#if toReturn > 0 && sale.person}
                    <button onclick={()=> sale.addAdditionalCredit = toReturn}>
                        <TextButton className="whitespace-nowrap w-auto">Retour als Guthaben</TextButton>
                    </button>
                {/if}
                {#if toReturn >= 0}
                    <button type="submit" name="redirectTo" value="/l/modules/sales">
                        <TextButton color="ok">Fertig</TextButton>
                    </button>
                {/if}
            </div>
        </NavigationActions>
    </form>
{/await}

{#if submitting}
    <Loading/>
{/if}
