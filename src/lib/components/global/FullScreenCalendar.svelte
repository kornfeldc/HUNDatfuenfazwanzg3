<script lang="ts">
    import moment from "moment";

    export interface ICalendarDayItem {
        text: string;
        className: string;
    }
    export interface ICalendarItem {
        day: Date;
        bottomLeft: ICalendarDayItem;
        bottomRight: ICalendarDayItem;
    }
    
    interface IProps {
        day?: Date;
        items?: ICalendarItem[];
    } 
    
    let { day = moment().startOf("day").toDate(), items = [] }: IProps = $props();
    
    let currentMonth = $state(moment(day));
</script>

<div>todo</div>

