<script lang="ts">
    import Pill from "$lib/components/global/Pill.svelte";

    interface IFilterItem {
        id: string;
        label: string;
    }

    interface IProps {
        items: Array<IFilterItem>;
        parameterName: string;
        selected: string;
        className?: string;
        onSelected?: (id: string) => void;
    }

    let {
        items = [],
        parameterName = "type",
        selected = "",
        className = "",
        onSelected = () => {
        }
    }: IProps = $props();
</script>

<div class={"flex flex-wrap "+className}>
    {#each items as item}
        <Pill selected={selected === item.id}>
            {#if !!onSelected}
                <button onclick={(event)=> {event.preventDefault(); event.stopPropagation(); onSelected(item.id); return false;}}>
                    {item.label}
                </button>
            {:else}
                <a href={"?"+parameterName+"="+item.id}>{item.label}</a>
            {/if}
        </Pill>
    {/each}
</div>
