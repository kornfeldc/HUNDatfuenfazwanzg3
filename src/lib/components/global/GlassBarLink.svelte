<script lang="ts">
    import {Util} from "$lib/util";
    let {children, selected, href} = $props();
</script>
<a href={href} class={Util.mapClass(
    "px-2 sm:px-4 py-1.5 text-xs sm:text-sm ", 
    selected, 
    "bg-white/70  text-gray-600  rounded-4xl", 
    "text-white")}>
    {@render children?.()}
</a>
