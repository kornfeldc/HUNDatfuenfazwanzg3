<script lang="ts">
    import GlassCircle from "./GlassCircle.svelte";
    let {children, href} = $props();
</script>
<GlassCircle>
    <a href={href} class={""}>
        {@render children?.()}
    </a>
</GlassCircle>
