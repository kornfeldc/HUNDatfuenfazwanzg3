<script lang="ts">
    import {Plus} from "@lucide/svelte";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";

    let {href = ""} = $props();
</script>
<GlassCircleLink {href}>
    <Plus class="text-slate-500"/>
</GlassCircleLink>
