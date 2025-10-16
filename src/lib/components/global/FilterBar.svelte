<script lang="ts">
    import {Util} from "$lib/util";
    import Pill from "$lib/components/global/Pill.svelte";
    
    interface IFilterItem {
        id: string;
        label: string;
    }

    interface IProps {
        items: Array<IFilterItem>;
        parameterName: string;
        selected: string;
        className: string;
    }

    let {
        items = [],
        parameterName = "type",
        selected = "",
        className = ""
    }: IProps = $props();
</script>

<div class={"flex flex-wrap px-3 "+className}>
    {#each items as item}
        <Pill selected={selected === item.id}>
            <a href={"?"+parameterName+"="+item.id}>{item.label}</a>
        </Pill>
    {/each}
</div>
