<script lang="ts">
    import {HfzApi} from "$lib/data/hfzApi";
    import SalesList from "../../../../components/sales/SalesList.svelte";
    import {Plus} from "@lucide/svelte";

    const api = HfzApi.create();

</script>
{#await api.getSales()}
    loading ...
{:then sales}
    <SalesList {sales}/>
{/await}

<div class="pos-fixed-bottom right">
    <div class="glass-circle m-1 p-1 flex">
        <a href="/l/dialogs/sale">
           <Plus class="text-slate-500"/>
        </a>
    </div>
</div>
