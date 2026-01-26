<script lang="ts">
import logo from "$lib/assets/logo.svg";
import Avatar from "$lib/components/global/Avatar.svelte";
</script>

<div class="flex p-2 sm:p-4 w-full shadow-xl shadow-primary/10 mb-2 sm:mb-4 items-center gap-4 ">
    <a href="/l/modules">
        <img src={logo} alt="logo" class="w-10 h-10">
    </a>
    <a href="/l/modules" class="w-full text-center">
        <div class="text-primary text-xl sm:text-3xl font-mono"><b class="font-extrabold">HUND</b><i>atfuenfazwanzg</i></div>
    </a> 
    <a href="/l/dialogs/user">
        <Avatar/>
    </a>
</div>
