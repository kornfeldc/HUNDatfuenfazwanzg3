<script lang="ts">
    import { enhance } from '$app/forms';
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import { Label } from "$lib/components/shadcn/ui/label";
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";
    import { Button } from "$lib/components/shadcn/ui/button";
    import { Util } from "$lib/util";
    import Loading from "$lib/components/global/Loading.svelte";
    import logo from "$lib/assets/logo.svg";

    let { data, form } = $props();
    let submitting = $state(false);
    let success = $state(false);

    const robCourse = $derived(data.robCourse);
    const isFull = $derived(robCourse.persons?.length >= robCourse.maxPersons);

    $effect(() => {
        if (form?.success) {
            success = true;
            setTimeout(() => {
                window.location.href = "https://svoe.og125.at/";
            }, 5000);
        }
    });
</script>

<div class="min-h-screen bg-background p-4 flex flex-col items-center gap-8 pt-12">
    <div class="flex flex-col items-center gap-2">
        <img src={logo} alt="logo" class="w-16 h-16">
        <div class="text-primary text-2xl font-mono"><b class="font-extrabold">HUND</b><i>atfuenfazwanzg</i></div>
    </div>

    <Card className="w-full max-w-md">
        <div class="flex flex-col gap-6">
            <div class="text-center flex flex-col gap-1">
                <CardTitleBig>ROB Kurs Anmeldung</CardTitleBig>
                <div class="text-muted-foreground text-lg">
                    {Util.formatDate(robCourse.date)}
                </div>
            </div>

            {#if success}
                <div class="bg-ok/10 border border-ok text-ok p-6 rounded-lg text-center animate-in fade-in zoom-in">
                    <div class="text-xl font-bold mb-2">Anmeldung erfolgreich!</div>
                    <p>Du wirst in Kürze weitergeleitet...</p>
                </div>
            {:else if isFull}
                <div class="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg text-center">
                    <div class="text-xl font-bold">Der Kurs ist bereits ausgebucht</div>
                </div>
            {:else}
                <form method="POST" use:enhance={() => {
                    submitting = true;
                    return async ({ update }) => {
                        await update();
                        submitting = false;
                    };
                }} class="flex flex-col gap-6">
                    <div class="flex flex-col gap-2">
                        <Label for="personName">Name</Label>
                        <InputGroup.Root>
                            <InputGroup.Input name="personName" id="personName" required placeholder="Dein Name" />
                        </InputGroup.Root>
                    </div>

                    <div class="flex flex-col gap-2">
                        <Label for="dogName">Name des Hundes</Label>
                        <InputGroup.Root>
                            <InputGroup.Input name="dogName" id="dogName" required placeholder="Name deines Hundes" />
                        </InputGroup.Root>
                    </div>

                    {#if form?.message}
                        <div class="text-destructive text-sm text-center font-medium">
                            {form.message}
                        </div>
                    {/if}

                    <div class="flex flex-col gap-4 mt-2">
                        <div class="text-muted-foreground text-sm italic">
                            Abmeldungen sind nur bis 24 Stunden vor Kursbeginn möglich
                        </div>

                        <Button type="submit" class="w-full h-auto py-3 whitespace-normal text-center" disabled={submitting}>
                            Anmelden
                        </Button>
                    </div>
                </form>
            {/if}
        </div>
    </Card>
</div>

{#if submitting}
    <Loading />
{/if}