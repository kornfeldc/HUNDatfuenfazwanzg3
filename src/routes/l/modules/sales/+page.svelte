<script lang="ts">
    import {Plus} from "@lucide/svelte";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    import SalesList from "$lib/components/sales/SalesList.svelte";
    let { data }: { data: any } = $props();
</script>
{#await data.sales}
    loading ...
{:then sales}
    <SalesList {sales}/>
{/await}

<PlaceAtBottom at="right">
    <GlassCircleLink href="/l/dialogs/sale">
        <Plus class="text-slate-500"/>
    </GlassCircleLink>
</PlaceAtBottom>
