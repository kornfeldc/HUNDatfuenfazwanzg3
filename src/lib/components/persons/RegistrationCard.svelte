<script lang="ts">
    import type {IPerson} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Bone, ChevronRight, Mail, MapPin, Megaphone, Phone, Star} from "@lucide/svelte";
    import {moment, Util} from "$lib/util";

    let {person}: { person: IPerson } = $props();

    const dogSexLabels: Record<string, string> = {male: "Rüde", female: "Hündin"};

    let registered = $derived(moment(person.registeredAt));
    let isNew = $derived(moment().diff(registered, 'days') < 7);

    // Age of the dog today; the club's courses are split at 6 months (Welpenkurs) and 7 months (Begleithundekurs).
    let dogMonths = $derived(person.dogBirthDate ? moment().diff(moment(person.dogBirthDate), 'months') : null);
    let dogAge = $derived.by(() => {
        if (dogMonths === null) return "";
        if (dogMonths < 1) return "unter 1 Monat";
        if (dogMonths < 24) return dogMonths === 1 ? "1 Monat" : `${dogMonths} Monate`;
        return `${Math.floor(dogMonths / 12)} Jahre`;
    });
    let dog = $derived([
        person.dogBreed,
        person.dogSex ? dogSexLabels[person.dogSex] : "",
        dogAge
    ].filter(Boolean).join(" · "));
</script>
<Card className="flex flex-col gap-2">
    <div class="flex items-start gap-2">
        <a href="/l/dialogs/person/{person.id}" class="flex items-center gap-2 font-bold text-lg w-full hover:text-primary">
            {person.lastName} {person.firstName}
            {#if person.isMember}
                <Star size="16" class="text-accent shrink-0"></Star>
            {/if}
        </a>
        <div class="text-right whitespace-nowrap text-sm text-muted-foreground" title={registered.fromNow()}>
            {#if isNew}
                <span class="rounded-full bg-primary/10 text-primary font-medium px-2 py-0.5 mr-1">Neu</span>
            {/if}
            {registered.format('DD.MM.YYYY HH:mm')}
        </div>
    </div>

    <div class="flex items-start gap-2">
        <Bone size="16" class="mt-1 shrink-0 text-muted-foreground"></Bone>
        <div>
            <span class="font-medium">{person.dogNames}</span>
            {#if dog}<span class="text-muted-foreground"> · {dog}</span>{/if}
            {#if dogMonths !== null}
                <span class="ml-1 text-xs rounded-full border border-border px-2 py-0.5 whitespace-nowrap">
                    {dogMonths <= 6 ? "Welpenkurs" : "Begleithundekurs"}
                </span>
            {/if}
            <div class="text-xs text-muted-foreground">
                Chip {person.dogChipNumber || "–"} · Vers. {person.dogInsuranceNumber || "–"}
            </div>
        </div>
    </div>

    <div class="grid gap-1 text-sm">
        {#if person.phone}
            <a href="tel:{person.phone}" class="flex items-center gap-2 hover:text-primary">
                <Phone size="16" class="shrink-0 text-muted-foreground"></Phone>{person.phone}
            </a>
        {/if}
        {#if person.email}
            <a href="mailto:{person.email}" class="flex items-center gap-2 hover:text-primary truncate">
                <Mail size="16" class="shrink-0 text-muted-foreground"></Mail>{person.email}
            </a>
        {/if}
        {#if person.street || person.city}
            <div class="flex items-center gap-2">
                <MapPin size="16" class="shrink-0 text-muted-foreground"></MapPin>
                {[person.street, [person.postalCode, person.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
            </div>
        {/if}
        {#if person.birthDate}
            <div class="text-xs text-muted-foreground pl-6">Geboren am {Util.formatDate(new Date(person.birthDate))}</div>
        {/if}
    </div>

    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto">
        {#if person.referralSource}
            <span class="flex items-center gap-1"><Megaphone size="14"></Megaphone>{person.referralSource}</span>
        {/if}
        {#if person.isOnMailingList}
            <span>Mailing-Liste</span>
        {/if}
        {#if !person.isActive}
            <span class="text-destructive">Inaktiv</span>
        {/if}
        {#if person.courseCount}
            <span>Einheit(en) frei: <span class="text-primary font-medium">{Util.formatCurrency(person.courseCount, false, 0)}</span></span>
        {/if}
        <a href="/l/dialogs/person/{person.id}" class="ml-auto flex items-center text-primary font-medium">
            Öffnen<ChevronRight size="14"></ChevronRight>
        </a>
    </div>
</Card>
