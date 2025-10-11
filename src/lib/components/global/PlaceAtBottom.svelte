<script lang="ts">
    import {Util} from "$lib/util";

    let {children, at = 'left'} = $props();
</script>
<div class={Util.mapClass("fixed bottom-0 p-3", at === 'left', "left-0", "right-0")}>
    {@render children?.()}
</div>
