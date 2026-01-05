<script lang="ts">
    import {onMount} from "svelte";
    let {children} = $props();

    onMount(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const systemDark = mq.matches;
        // if(systemDark)
        //     document.body.parentElement!.classList.add('dark');
    });
</script>

{@render children?.()}
