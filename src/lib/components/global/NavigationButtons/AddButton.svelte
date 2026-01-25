<script lang="ts">
    import {Plus} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";

    let {href = "", className = ""} = $props();
</script>
<GlassCircleLink {href} className={" bg-primary/40! dark:bg-primary/70! border-0 shadow-sm " + className}>
    <Plus class="text-primary dark:text-primary-foreground"/>
</GlassCircleLink>
