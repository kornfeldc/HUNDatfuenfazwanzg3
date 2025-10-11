<script lang="ts">
    import type {ISale} from "$lib/data/hfzApi";
    import SalesListEntry from "./SalesListEntry.svelte";

    interface IProps {
        sales: Array<ISale>;
    }

    let {sales}: IProps = $props();
</script>

{#each sales as sale}
    <div class="m-4">
        <SalesListEntry {sale}/>
    </div>
{/each}