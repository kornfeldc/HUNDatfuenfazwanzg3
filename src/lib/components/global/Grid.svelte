<script lang="ts">
    let { children, minColumnWidth = "16em",  className = "" } = $props();
</script>
<div class={"grid grid-cols-[repeat(auto-fit,minmax("+minColumnWidth+",1fr))] gap-2 sm:gap-4 mx-4 ${className}"}>
    {@render children?.()}
</div>
