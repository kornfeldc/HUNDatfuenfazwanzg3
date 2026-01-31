<script lang="ts">
    import History from "$lib/components/global/History.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import Loading from "$lib/components/global/Loading.svelte";

    let {data} = $props();

    const loadData = async () => {
        return {
            history: await data.history,
            title: await data.title
        }
    }
</script>

{#await loadData()}
    <Loading/>
{:then res}
    <Card className="max-w-xl m-auto mb-4">
        <CardTitleBig>{res.title}</CardTitleBig>
    </Card>

    <div class="max-w-xl m-auto pb-20">
        <History history={res.history}/>
    </div>

    <PlaceAtBottom>
        <BackButton/>
    </PlaceAtBottom>
{/await}
