<script lang="ts">
    import type {IRobCourse} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Util} from "$lib/util";
    import {Calendar, Users} from "@lucide/svelte";

    interface IProps {
        robCourse: IRobCourse;
    }

    let {robCourse}: IProps = $props();
</script>
<a href="/l/dialogs/rob/{robCourse.id}">
    <Card>
        <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 font-bold text-lg w-full">
                <Calendar size="20" class="text-muted-foreground"></Calendar>
                {Util.formatDate(robCourse.date)}
            </div>
            <div class="whitespace-nowrap text-base text-ok">
                <span class="text-primary text-lg font-bold">{robCourse.persons?.length ?? 0}</span>
            </div>
        </div>
        <div class="flex items-center">
            <div class="text-muted-foreground text-md flex items-center w-full">
                Max. {robCourse.maxPersons} Personen
            </div>
            <div class="whitespace-nowrap text-sm flex items-center gap-1">
                <Users size="16"></Users>
                Personen angemeldet
            </div>
        </div>
    </Card>
</a>
