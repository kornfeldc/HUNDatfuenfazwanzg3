<script lang="ts">
    let { children, className = "" } = $props();
</script>
<div class={"w-full text-center font-bold text-2xl text-muted-foreground font-mono mb-2 " + className}>
    {@render children?.()}
</div>
