<script lang="ts">
    import NavigationBar from "../../../components/global/NavigationBar.svelte";
    import logo from '$lib/assets/logo.svg';
    import TopBar from "../../../components/global/TopBar.svelte";
    
    let { children } = $props();
</script>

<TopBar/>
{@render children?.()}
<NavigationBar/>
