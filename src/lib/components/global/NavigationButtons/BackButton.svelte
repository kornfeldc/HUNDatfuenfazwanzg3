<script lang="ts">
    import {ArrowLeft} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    let {href = "", className = ""} = $props();
    
    const onclick = () => {
        if(href) return;
        history.back(); 
        return false;
    }
</script>
<a href={href ?? '#'} onclick={()=> onclick()}>
    <GlassCircleLink className={" bg-accent/50! border-0 drop-shadow-accent/90 drop-shadow-xl " + className} {href}>
        <ArrowLeft class="text-accent-foreground"/>
    </GlassCircleLink>
</a>
