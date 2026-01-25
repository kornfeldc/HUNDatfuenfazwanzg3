<script lang="ts">
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";
    let {className = ""} = $props();
</script>
<GlassCircleLink className={" bg-ok! border-0 w-30 text-white shadow-md " + className}>
    Speichern
</GlassCircleLink>
