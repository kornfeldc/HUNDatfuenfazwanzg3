<script lang="ts">
    import {Dog} from "@lucide/svelte";
    import {page} from "$app/state";

    interface IProps {
        size?: number;
    }

    let {size = 10}: IProps = $props();

    let imageError = $state(false);

    $effect(() => {
        page.data.hfzUser?.avatarUrl;
        imageError = false;
    });
</script>
{#if page.data.hfzUser?.avatarUrl && !imageError}
    <img src={page.data.hfzUser.avatarUrl} alt="avatar"
         class={"w-"+size+" h-"+size+" rounded-full border-2 border-primary/20 object-cover"} onerror={() => imageError = true}>
{:else}
    <Dog class="text-primary/80" size="42"/>
{/if}
