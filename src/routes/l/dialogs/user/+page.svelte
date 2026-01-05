<script lang="ts">
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    // noinspection ES6UnusedImports
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";
    // noinspection ES6UnusedImports
    import * as Select from "$lib/components/shadcn/ui/select/index.js";

    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import Loading from "$lib/components/global/Loading.svelte";
    import {type IUser} from "$lib/data/hfzApi";
    import {uiState} from "$lib/stores/uiState.svelte";
    import {goto} from "$app/navigation";
    import {Button} from "$lib/components/shadcn/ui/button";
    import GlassCircleLink from "$lib/components/global/GlassCircleLink.svelte";

    let {data}: { data: any; } = $props();
    let formUser = $state({} as IUser);

    const loadUser = async () => {
        const user = await data.user;
        formUser.id = user?.id;
        formUser.theme = user?.theme ?? "system";
    }
</script>

{#await loadUser()}
    <Loading></Loading>
{:then _}
    <form method="post" action={`/l/dialogs/user`}>
        <input type="hidden" name="redirectTo" value={uiState.getLastRouteSmart()}>
        <Card className="max-w-xl m-auto">
            {formUser.theme}
        </Card>

        <PlaceAtBottom>
            <BackButton></BackButton>
        </PlaceAtBottom>
        <NavigationActions>
            <div slot="actions">
                <button type="button" onclick={() => goto('/logout')}>
                    <GlassCircleLink className={" bg-destructive! border-0 w-30 text-destructive-foreground drop-shadow-destructive/60 drop-shadow-xl "}>
                        Ausloggen 
                    </GlassCircleLink>
                </button>

<!--                <button type="submit" >-->
<!--                    <SaveButton></SaveButton>-->
<!--                </button>-->
            </div>
        </NavigationActions>
    </form>
{/await}
