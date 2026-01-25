<script lang="ts">
    import {Util} from "$lib/util";
    let {children, selected, href} = $props();
</script>
<a href={href} class={Util.mapClass(
    "px-2 sm:px-4 py-1.5 text-xs sm:text-sm transition-all duration-200 ", 
    selected, 
    "bg-white/90 text-gray-900 rounded-4xl shadow-sm", 
    "text-white/70 hover:text-white hover:bg-white/5 rounded-4xl")}>
    {@render children?.()}
</a>
