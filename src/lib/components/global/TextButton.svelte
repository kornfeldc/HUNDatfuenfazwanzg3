<script lang="ts">
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    let {children, className = "", color = "primary", href = ""} = $props();
    
    let colorClass = $derived(
        "bg-"+color+"! text-"+color+"-foreground drop-shadow-"+color+"/40 "
    );
    
</script>
<GlassCircleLink className={["border-0 w-30 shadow-md", colorClass, className].join(" ")} {href}>
    {@render children?.()}
</GlassCircleLink>
