<script lang="ts">
    import Loading from "$lib/components/global/Loading.svelte";
    import NavigationActions from "$lib/components/global/NavigationActions.svelte";
    import {type ISale} from "$lib/data/hfzApi";
    import PlaceAtBottom from "$lib/components/global/PlaceAtBottom.svelte";
    import BackButton from "$lib/components/global/NavigationButtons/BackButton.svelte";
    import FullScreenCalendar, {type ICalendarItem} from "$lib/components/global/FullScreenCalendar.svelte";
    import {page} from '$app/stores';
    import {Util, moment} from "$lib/util";
    import TextButton from "$lib/components/global/TextButton.svelte";

    let {data}: { data: any } = $props();

    let date = $derived($page.url.searchParams.get("date") ?? moment().format("YYYY-MM-DD"));

    let sales = $state([] as Array<ISale>);
    const loadSales = async () => {
        sales = await data.sales;
        console.log("sales", sales);
    }

    let calendarItems = $derived.by(() => {
        let calculatedResults = [] as Array<{ day: Date, toPay: number, paid: number }>;
        sales.forEach(sale => {
            const relevantDay = moment(sale.saleDate).startOf('day');
            const entry = calculatedResults.find((r: any) => moment(r.day).isSame(relevantDay, "day"));
            if (!entry) {
                calculatedResults.push({
                    day: relevantDay.toDate(),
                    toPay: sale.payDate ? 0 : sale.toPay,
                    paid: sale.payDate ? sale.toPay : 0
                });
            } else {
                entry.toPay += sale.payDate ? 0 : sale.toPay;
                entry.paid += sale.payDate ? sale.toPay : 0;
            }
        });

        return calculatedResults.map(r => {
            return {
                day: r.day,
                bottomLeft: {
                    text: r.toPay ? Util.formatCurrency(r.toPay, false, 0) : "",
                    className: "text-amber-500"
                },
                bottomRight: {
                    text: r.paid ? Util.formatCurrency(r.paid, false, 0) : "",
                    className: "text-ok"
                }
            } as ICalendarItem;
        });
    });
</script>
{#await loadSales()}
    <Loading></Loading>
{:then _}
    <div class="px-2 sm:px-4 md:px-8 h-full">
        <FullScreenCalendar
                day={moment(date).toDate()}
                items={calendarItems}
                monthHref="/l/modules/calendar?date=%date%"
                dayHref="/l/modules/sales?date=%date%"></FullScreenCalendar>
    </div>
{/await}

<PlaceAtBottom>
    <BackButton></BackButton>
</PlaceAtBottom>

<NavigationActions>
    <div slot="actions" class="flex gap-2">
        <TextButton color="muted" href={"/l/modules/statistics"}>Statistiken</TextButton>
        <TextButton color="primary" href={"/l/modules/sales?date="+moment().format('YYYY-MM-DD')}>Heute</TextButton>
    </div>
</NavigationActions>
