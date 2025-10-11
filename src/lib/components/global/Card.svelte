<script lang="ts">
    let { children, className = "" } = $props();
</script>
<div class={"p-4 shadow-lg shadow-slate-300 rounded-lg " + className}>
    {@render children?.()}
</div>
