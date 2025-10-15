<script lang="ts">
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    let {className = ""} = $props();
</script>
<GlassCircleLink className={" bg-ok! border-0 w-30 text-white drop-shadow-ok/60 drop-shadow-xl " + className}>
    Speichern
</GlassCircleLink>
