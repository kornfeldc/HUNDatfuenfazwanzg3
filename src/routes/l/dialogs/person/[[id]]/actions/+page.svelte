<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import {Button} from "$lib/components/shadcn/ui/button";
    import {Input} from "$lib/components/shadcn/ui/input";
    import type {IPerson} from "$lib/data/hfzApi";
    import {moment} from "$lib/util";
    import {invalidateAll} from "$app/navigation";

    let {data}: { data: any; } = $props();
    let person = $state({} as IPerson);
    let loading = $state(false);
    
    let actionData = $state({
        coursesToRemove: 1,
        coursesToAdd: 10,
        creditToAdd: 0,
        perDate: moment().format("YYYY-MM-DD"),
        today: moment().format("YYYY-MM-DD")
    } as any);

    const loadPerson = async () => {
        person = await data.person;
    }
    
    const removeCourses = async () => await modifyCourses(-actionData.coursesToRemove, actionData.perDate);
    const addCourses = async () => await modifyCourses(actionData.coursesToAdd, actionData.today);
    const modifyCourses = async (count: number, perDate: string) => {
        const fd = new FormData();
        fd.set('count', String(count));
        fd.set('date', perDate);
        
        loading = true;
        const res = await fetch('?/modifyCourses', { method: 'POST', body: fd });
        loading = false;
        
        if (!res.ok) {
            console.error('modifyCourses failed', await res.text());
            alert('Fehler beim Aktualisieren der Kurse.');
            return;
        }
        await invalidateAll();
    }
    const addCredit = async () => await modifyCredit(actionData.creditToAdd, actionData.today);
    const modifyCredit = async (amount: number, perDate: string) => {
        const fd = new FormData();
        fd.set('amount', String(amount));
        fd.set('date', perDate);
        
        loading = true;
        const res = await fetch('?/modifyCredit', { method: 'POST', body: fd });
        loading = false;
        
        if (!res.ok) {
            console.error('modifyCredit failed', await res.text());
            alert('Fehler beim Aufbuchen des Guthabens.');
            return;
        }
        await invalidateAll();
    }
</script>

{#if loading}
    <Loading></Loading>
{/if}

{#await loadPerson()}
    <Loading></Loading>
{:then _}
    <Card className="max-w-xl m-auto">
        <PersonOverview person={person}></PersonOverview>
    </Card>

    <Card className="max-w-xl m-auto">
        
        <div class="grid grid-cols-[6em_1fr] gap-4 pt-4">
            <Input type="number" placeholder="Anzahl" bind:value={actionData.coursesToRemove}></Input>
            <div>
                <Input type="date" placeholder="Datum" bind:value={actionData.perDate}/>
            </div>
            <Button variant="outline" class="col-span-2 border-destructive text-destructive hover:bg-destructive/10" onclick={()=> removeCourses()}>Kurseinheit abziehen</Button>
        </div>
        
        <div class="border-[1px] border-border mt-4"></div>
        
        <div class="grid grid-cols-[6em_1fr] gap-4 pt-4">

            <Input type="number" class="text-right" placeholder="Anzahl" bind:value={actionData.coursesToAdd}></Input>
            <Button variant="outline" class="border-ok text-ok hover:bg-ok/10" onclick={()=> addCourses()}>Kurse aufbuchen</Button>

            <Input type="number" class="text-right" placeholder="Anzahl" bind:value={actionData.creditToAdd}></Input>
            <Button variant="outline" class="border-primary text-primary hover:bg-primary/10" onclick={()=> addCredit()}>Guthaben aufbuchen</Button>
        </div>
    </Card>
{/await}
