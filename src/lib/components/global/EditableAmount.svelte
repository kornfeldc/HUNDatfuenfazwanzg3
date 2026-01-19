<script lang="ts">
    import {Util} from "$lib/util";

    let { value = $bindable(), className = "", readonly = false, onCommit = () => {} } = $props();

    let isEditing = $state(false);
    let inputRef: HTMLInputElement | undefined = $state();

    function startEditing() {
        if (!readonly) {
            isEditing = true;
        }
    }

    function stopEditing() {
        isEditing = false;
        onCommit();
    }
    
    $effect(() => {
        if (isEditing && inputRef) {
            inputRef.focus();
            inputRef.select();
        }
    })
</script>

<div class="w-full">
    {#if isEditing}
        <input 
            bind:this={inputRef}
            type="number" 
            bind:value 
            onblur={stopEditing}
            onkeydown={(e) => e.key === 'Enter' && stopEditing()}
            class="w-full text-center text-3xl border rounded p-1 bg-background text-foreground" 
        />
    {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            onclick={startEditing} 
            class={Util.mapClass(`text-center text-3xl ${className} ${readonly ? "" : "cursor-pointer"}`, !value, "text-muted-foreground/50")}
        >
            {Util.formatCurrency(value, false)}
        </div>
    {/if}
</div>