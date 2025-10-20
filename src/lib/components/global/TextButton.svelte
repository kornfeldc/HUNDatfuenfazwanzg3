<script lang="ts">
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    let {children, className = "", color = "primary", href = ""} = $props();
    
    let colorClass = $derived(
        "bg-"+color+"! text-"+color+"-foreground drop-shadow-"+color+"/60 "
    );
    
</script>
<GlassCircleLink className={["border-0 w-30 drop-shadow-xl", colorClass, className].join(" ")} {href}>
    {@render children?.()}
</GlassCircleLink>
