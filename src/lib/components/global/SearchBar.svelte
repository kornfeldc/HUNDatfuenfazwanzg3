<script lang="ts">
    import {CircleX} from "@lucide/svelte";
    import GlassBar from "$lib/components/global/GlassBar.svelte";
    import {onMount, tick} from "svelte";
    import {Util} from "$lib/util";

    interface IProps {
        value?: any;
        fullWidth?: boolean;
        onEnter?: () => void;
        onClear?: () => void;
        // stayOpenedOnBlur?: boolean;
        // onSearchOrBlur?: (event: any) => void;
    }

    let inputEl: HTMLInputElement | null = null;

    let {
        value = $bindable(""),
        fullWidth = false,
        onEnter = undefined,
        onClear = undefined,
        // stayOpenedOnBlur = false,
        // onSearchOrBlur = undefined,
    }: IProps = $props();

    const inputFocused = (event: any) => {
        event.stopPropagation();
        // event.preventDefault();
        return false;
    }

    const inputBlurred = (event: any) => {
        event.stopPropagation();
        // event.preventDefault();
        return false;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter") 
            return;
        event.preventDefault();
        if(onEnter) 
            onEnter();
    }

    const clearSearch = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        value = "";
        inputEl?.focus();
        if(onClear) 
            onClear();
        return false;
    }

    onMount(() => {
        const focus = async () => {
            await tick();
            inputEl?.focus();
            inputEl?.select?.();
        }

        focus();
        const t1 = setTimeout(focus, 100);
        const t2 = setTimeout(focus, 300);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        }
    });

    let calcWidth = $derived(fullWidth ? "calc(100vw - 4.5em)" : "calc(100vw - 7em)");
</script>

<GlassBar className="w-full">
    <div class="flex items-center" style={`width: ${calcWidth}`}>
        <input
                bind:this={inputEl}
                bind:value={value}
                autofocus
                class={Util.mapClass("border-0 m-0 p-1.5 mr-2 bg-transparent rounded-full text-white placeholder-gray-200 text-base focus:outline-none", true, "w-full", "")}
                onblur={(event) => inputBlurred(event)}
                onfocus={(event) => inputFocused(event)}
                onkeydown={(e) => handleKeyDown(e)}
                placeholder="Suche"
                type="text"/>

        <button class="pr-2 text-gray-200"
                onclick={(event) => clearSearch(event)}>
            <CircleX/>
        </button>
    </div>
</GlassBar>
