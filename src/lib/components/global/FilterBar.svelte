<script lang="ts">
    import {Util} from "$lib/util";
    
    interface IFilterItem {
        id: string;
        label: string;
    }

    interface IProps {
        items: Array<IFilterItem>;
        parameterName: string;
        selected: string;
    }

    let {
        items = [],
        parameterName = "type",
        selected = ""
    }: IProps = $props();
</script>

<div class="flex flex-wrap p-3">
    {#each items as item}
        <a href={"?"+parameterName+"="+item.id} class={Util.mapClass(
            "whitespace-nowrap p-1 px-2 text-sm m-1 rounded-full", 
            selected === item.id, 
            "bg-pill-active text-pill-active-foreground drop-shadow-slate-700/50 drop-shadow-md", 
            "bg-pill text-pill-foreground")}>{item.label}</a>
    {/each}
</div>
