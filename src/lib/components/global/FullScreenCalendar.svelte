<script lang="ts">
    import moment from "moment";
    import {Util} from "$lib/util";
    import Pill from "$lib/components/global/Pill.svelte";
    import {CalendarDays, CircleArrowLeft, CircleArrowRight} from "@lucide/svelte";

    export interface ICalendarDayItem {
        text: string;
        className: string;
    }

    export interface ICalendarItem {
        day: Date;
        bottomLeft?: ICalendarDayItem;
        bottomRight?: ICalendarDayItem;
    }

    interface IProps {
        day?: Date;
        items?: ICalendarItem[];
        dayHref?: string;
        monthHref?: string;
    }

    type Day = {
        day: Date,
        formattedDate: string,
        isInCurrentMonth: boolean,
        isToday: boolean,
        bottomLeftText: string,
        bottomLeftClassName: string,
        bottomRightText: string,
        bottomRightClassName: string
    }

    moment.locale('de');
    
    let {day = moment().startOf("day").toDate(), dayHref = "", monthHref = "", items = []}: IProps = $props();

    let currentMonth = $derived(moment(day));
    let firstDay = $derived(currentMonth.clone().startOf("month").startOf("week"));
    let lastDay = $derived(currentMonth.clone().endOf("month").endOf("week"));

    let days = $derived.by(() => {
        const result: Day[] = [];
        let current = firstDay.clone();
        while (current.isSameOrBefore(lastDay)) {
            const calendarItem = items.find(i => moment(i.day).isSame(current, 'day'));
            result.push({
                day: current.toDate(),
                formattedDate: current.format('DD.'),
                isInCurrentMonth: current.isSame(currentMonth, 'month'),
                isToday: moment(current).isSame(moment(), 'day'),
                bottomLeftText: calendarItem?.bottomLeft?.text ?? '',
                bottomLeftClassName: calendarItem?.bottomLeft?.className ?? '',
                bottomRightText: calendarItem?.bottomRight?.text ?? '',
                bottomRightClassName: calendarItem?.bottomRight?.className ?? '',
            });
            current.add(1, 'day');
        }
        return result;
    });
    
    let weekDayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
</script>

<div class="flex w-full items-center justify-center mb-4">
    <a href={monthHref?.replace("%date%",moment(day).subtract(1,"month").format("YYYY-MM-DD"))}>
       <CircleArrowLeft class="text-slate-400" /> 
    </a>
    <a href={monthHref?.replace("%date%",moment().format("YYYY-MM-DD"))}>
        <Pill selected={false} className="flex items-center justify-center gap-2 p-2 px-4 w-48 mx-4">
            <CalendarDays/>
            {moment(day).format("MMMM YYYY")} 
        </Pill>
    </a>
    <a href={monthHref?.replace("%date%",moment(day).add(1,"month").format("YYYY-MM-DD"))}>
        <CircleArrowRight class="text-slate-400"/>
    </a>
</div>

<div class="grid grid-cols-7 w-full gap-0.5">
    {#each weekDayNames as weekDayName}
        <div class="pl-2">{weekDayName}</div>
    {/each}
    {#each days as day}
        <a href={dayHref?.replace("%date%",moment(day.day).format("YYYY-MM-DD"))}>
            <div class={Util.mapClass(
                "border-[1px] rounded-lg w-full grid grid-cols-1 sm:grid-cols-2 p-2 min-h-20",
                day.isToday, 
                "border-primary shadow-primary shadow-md",
            )}>
                <div class={Util.mapClass(
                    "text-xs sm:col-span-2", 
                    !day.isInCurrentMonth, 
                    "text-muted-foreground/50", 
                    Util.mapClass(
                        "", 
                        day.isToday, 
                        "text-primary font-bold"
                        ))}>{day.formattedDate}</div>
                <div class={"text-xs text-right sm:text-left self-end " + day.bottomLeftClassName}>{day.bottomLeftText}</div>
                <div class={"text-xs text-right self-end "+day.bottomRightClassName}>{day.bottomRightText}</div>
            </div>
        </a>
    {/each}
</div>

