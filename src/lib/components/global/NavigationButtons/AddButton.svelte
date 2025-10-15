<script lang="ts">
    import {Plus} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";

    let {href = "", className = ""} = $props();
</script>
<GlassCircleLink {href} className={" bg-primary/40! border-0 drop-shadow-primary/60 drop-shadow-xl " + className}>
    <Plus class="text-primary"/>
</GlassCircleLink>
