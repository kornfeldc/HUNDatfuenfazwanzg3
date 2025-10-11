<script lang="ts">
    import type {IPerson, IRobCourse} from "$lib/data/hfzApi";
    import Card from "$lib/components/global/Card.svelte";
    import {Bone, Star} from "@lucide/svelte";
    import {Util} from "$lib/util";

    interface IProps {
        robCourse: IRobCourse;
    }

    let {robCourse}: IProps = $props();
</script>
<Card>
    <div class="flex">
        <div class="font-bold text-lg w-full">
            {Util.formatDate(robCourse.date)}
        </div>
            <div>
                {robCourse.persons.length}
            </div>
    </div>
    <div class="flex items-center">
        <div class="text-muted-foreground text-md flex items-center w-full">
            Max. {robCourse.maxPersons} Personen
        </div>
        <div class="whitespace-nowrap text-sm">
            Personen angemeldet
        </div>
    </div>
</Card>