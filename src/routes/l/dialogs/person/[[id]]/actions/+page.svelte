<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import PersonOverview from "$lib/components/persons/PersonOverview.svelte";
    import {Button} from "$lib/components/shadcn/ui/button";
    import {Input} from "$lib/components/shadcn/ui/input";
    import type {IPerson} from "$lib/data/hfzApi";

    let {data}: { data: any; } = $props();
    let person = $state({} as IPerson);
    
    let actionData = $state({
        coursesToRemove: 1,
        coursesToAdd: 10,
        creditToAdd: 0
    } as any);

    const loadPerson = async () => {
        person = await data.person;
    }
    
    const removeCourses = async () => await modifyCourses(-actionData.coursesToRemove);
    const addCourses = async () => await modifyCourses(actionData.coursesToAdd);
    const modifyCourses = async (count: number) => {
        // todo
    }
    const addCredit = async () => await modifyCredit(actionData.creditToAdd);
    const modifyCredit = async (amount: number) => {
        // todo
    }
</script>

{#await loadPerson()}
    <Loading></Loading>
{:then _}
    <Card className="max-w-xl m-auto">
        <PersonOverview person={person}></PersonOverview>
    </Card>

    <Card className="max-w-xl m-auto">
        <div class="grid grid-cols-[auto_1fr] grid-col-t gap-4 pt-4">
            <Input type="number" placeholder="Anzahl" bind:value={actionData.coursesToRemove}></Input>
            <Button onclick={()=> removeCourses()}>Kurseinheit abziehen</Button>

            <Input type="number" placeholder="Anzahl" bind:value={actionData.coursesToAdd}></Input>
            <Button onclick={()=> addCourses()}>Kurse aufbuchen</Button>

            <Input type="number" placeholder="Anzahl" bind:value={actionData.creditToAdd}></Input>
            <Button onclick={()=> addCredit()}>Guthaben aufbuchen</Button>
        </div>
    </Card>
{/await}
