<script lang="ts">
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import SaveButton from "$lib/components/global/NavigationButtons/SaveButton.svelte";
    // noinspection ES6UnusedImports
    import * as InputGroup from "$lib/components/shadcn/ui/input-group/index.js";
    // noinspection ES6UnusedImports
    import * as Select from "$lib/components/shadcn/ui/select/index.js";

    import {moment} from "$lib/util";
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
    import Avatar from "$lib/components/global/Avatar.svelte";
    import { enhance } from '$app/forms';

    let {data, form}: { data: any, form: any } = $props();
    let formUser = $state({} as IUser);
    let submitting = $state(false);

    const loadUser = async () => {
        const user = await data.hfzUser;
        formUser.theme = user?.theme ?? "system";
        formUser.email = user?.email;
        formUser.name = user?.name;
        formUser.avatarUrl = user?.avatarUrl;
        formUser.lastLogin = user?.lastLogin;
        formUser.admin = user?.admin;
    }
    
    const themeLabels = {
        "system": "Automatisch",
        "light": "Hell",
        "dark": "Dunkel"
    };

    function submitForm() {
        setTimeout(()=> {
            (document.getElementById('userForm') as HTMLFormElement)?.requestSubmit();
        }, 200);
    }
</script>

{#await loadUser()}
    <Loading></Loading>
{:then _}
    <form method="post" action="?/updateTheme" id="userForm" use:enhance={() => {
        submitting = true;
        return async ({ update }) => {
            await update();
            submitting = false;
        };
    }}>
        <input type="hidden" name="redirectTo" value={uiState.getLastRouteSmart()}>
        <Card className="max-w-xl m-auto">
            <div class="flex flex-col items-center gap-4 p-4">
                <Avatar size={24}/>

                <div class="text-center">
                    <h2 class="text-2xl font-bold">{formUser.name ?? 'Unbekannter Benutzer'}</h2>
                    <p class="text-muted-foreground">{formUser.email ?? ''}</p>
                </div>

                <div class="w-full border-t pt-4 mt-2">
                    <div class="flex justify-between items-center text-sm h-10">
                        <span class="text-muted-foreground">Dunkel/Hell:</span>
                        <div class="w-32">
                             <Select.Root type="single" name="theme" bind:value={formUser.theme} onValueChange={submitForm}>
                                <Select.Trigger class="w-full capitalize">{themeLabels[formUser.theme]}</Select.Trigger>
                                <Select.Content>
                                    {#each Object.keys(themeLabels) as theme}
                                        <Select.Item value={theme}>{themeLabels[theme]}</Select.Item>
                                        {/each} 
                                </Select.Content>
                            </Select.Root>
                        </div>
                    </div>
                    {#if formUser.lastLogin}
                        <div class="flex justify-between text-sm mt-2">
                            <span class="text-muted-foreground">Letzter Login:</span>
                            <span class="font-medium">{moment(new Date(formUser.lastLogin)).format('DD.MM.YYYY HH:mm')}</span>
                        </div>
                    {/if}
                    <div class="flex justify-between text-sm mt-2">
                        <span class="text-muted-foreground">Version:</span>
                        <span class="font-medium">v{data.version}</span>
                    </div>
                </div>
            </div>
        </Card>
    </form>

    {#if formUser.admin && data.unassignedUsers?.length > 0}
        <Card className="max-w-xl m-auto mt-4">
             <div class="flex flex-col gap-4 p-4">
                 <h3 class="font-bold text-lg">Benutzer freischalten</h3>
                 {#if form?.error}
                     <div class="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
                         {form.error}
                     </div>
                 {/if}
                 {#each data.unassignedUsers as user}
                     <div class="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                         <div class="flex flex-col">
                             <span class="font-medium">{user.email}</span>
                         </div>
                         <form method="post" action="?/assignOg" use:enhance={() => {
                             submitting = true;
                             return async ({ update }) => {
                                 await update();
                                 submitting = false;
                             };
                         }}>
                             <input type="hidden" name="email" value={user.email} />
                             <Button type="submit" size="sm" variant="secondary">Freischalten</Button>
                         </form>
                     </div>
                 {/each}
             </div>
        </Card>
    {/if}

    <PlaceAtBottom>
        <BackButton></BackButton>
    </PlaceAtBottom>
    <NavigationActions>
        <div slot="actions">
            <button type="button" onclick={() => goto('/logout')}>
                <GlassCircleLink className={" bg-destructive! border-0 w-30 text-destructive-foreground shadow-md "}>
                    Ausloggen 
                </GlassCircleLink>
            </button>

<!--                <button type="submit" >-->
<!--                    <SaveButton></SaveButton>-->
<!--                </button>-->
        </div>
    </NavigationActions>
{/await}

{#if submitting}
    <Loading/>
{/if}
