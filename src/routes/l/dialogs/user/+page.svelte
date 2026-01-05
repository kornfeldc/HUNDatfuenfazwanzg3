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
    import {Dog} from "@lucide/svelte";

    let {data}: { data: any; } = $props();
    let formUser = $state({} as IUser);

    const loadUser = async () => {
        const user = await data.hfzUser;
        formUser.id = user?.id;
        formUser.theme = user?.theme ?? "system";
        formUser.email = user?.email;
        formUser.name = user?.name;
        formUser.avatarUrl = user?.avatarUrl;
        formUser.lastLogin = user?.lastLogin;
    }
</script>

{#await loadUser()}
    <Loading></Loading>
{:then _}
    <form method="post" action={`/l/dialogs/user`}>
        <input type="hidden" name="redirectTo" value={uiState.getLastRouteSmart()}>
        <Card className="max-w-xl m-auto">
            <div class="flex flex-col items-center gap-4 p-4">
                {#if formUser.avatarUrl}
                    <img src={formUser.avatarUrl} alt="avatar" class="w-24 h-24 rounded-full border-4 border-primary/20 shadow-lg object-cover">
                {:else}
                    <div class="bg-muted p-6 rounded-full">
                        <Dog class="text-primary/80" size={64}/>
                    </div>
                {/if}

                <div class="text-center">
                    <h2 class="text-2xl font-bold">{formUser.name ?? 'Unbekannter Benutzer'}</h2>
                    <p class="text-muted-foreground">{formUser.email ?? ''}</p>
                </div>

                <div class="w-full border-t pt-4 mt-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Thema:</span>
                        <span class="font-medium capitalize">{formUser.theme}</span>
                    </div>
                    {#if formUser.lastLogin}
                        <div class="flex justify-between text-sm mt-2">
                            <span class="text-muted-foreground">Letzter Login:</span>
                            <span class="font-medium">{new Date(formUser.lastLogin).toLocaleString('de-DE')}</span>
                        </div>
                    {/if}
                </div>
            </div>
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
