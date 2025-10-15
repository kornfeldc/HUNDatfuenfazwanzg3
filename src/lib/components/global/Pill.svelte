<script lang="ts">
    import {Util} from "$lib/util";
    let {children, selected = false, className = ""} = $props();
</script>
<div class={Util.mapClass(
            "whitespace-nowrap p-1 px-2 text-sm m-1 rounded-full cursor-pointer",
            selected,
            "bg-pill-active text-pill-active-foreground drop-shadow-slate-700/50 drop-shadow-md",
            "bg-pill text-pill-foreground") + " " + className}>
    {@render children?.()}
</div>
