<script lang="ts">
    import FilterBar from "$lib/components/global/FilterBar.svelte";
    import Card from "$lib/components/global/Card.svelte";
    import CardTitleBig from "$lib/components/global/CardTitleBig.svelte";
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let { data } = $props();

    let chartReady = $state(false);
    let apexChart: any;

    let isDarkMode = $state(false);

    onMount(async () => {
        const module = await import('apexcharts');
        apexChart = module.default;
        chartReady = true;

        const checkDarkMode = () => {
            isDarkMode = document.documentElement.classList.contains('dark');
        };

        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    });

    const chartAction = (node: HTMLElement, optionsFn: () => any) => {
        let chart: any;
        
        $effect(() => {
            const currentOptions = optionsFn();
            
            if (chartReady && apexChart && node) {
                const snapshot = $state.snapshot(currentOptions);
                if (chart) {
                    chart.updateOptions(snapshot);
                } else {
                    chart = new apexChart(node, snapshot);
                    chart.render();
                }
            }
        });

        return {
            destroy() {
                if (chart) {
                    chart.destroy();
                }
            }
        };
    };

    let filter = $derived($page.url.searchParams.get("filter") ?? "all");

    const filterItems = $derived([
        {id: "all", label: "Alle Jahre"},
        ...data.years.map(y => ({id: y, label: y}))
    ]);

    const chartColors = [
        '#3273DC', // Primary Blue
        '#FFAA00', // Accent Orange
        '#00BC7D', // OK Green
        '#FE9A00', // Warning Yellow
        '#FD2055', // Destructive Pink/Red
        '#5b21b6', // Violet
        '#155e75', // Cyan
        '#9d174d', // Pink
        '#84cc16', // Lime
        '#14b8a6'  // Teal
    ];

    const pieColors = [
        '#3b82f6', // Blue 500
        '#ef4444', // Red 500
        '#f59e0b', // Amber 500
        '#10b981', // Emerald 500
        '#8b5cf6', // Violet 500
        '#f97316', // Orange 500
        '#06b6d4', // Cyan 500
        '#ec4899', // Pink 500
        '#84cc16', // Lime 500
        '#14b8a6'  // Teal 500
    ];

    const commonOptions = $derived({
        chart: {
            toolbar: { show: false },
            fontFamily: 'inherit',
            background: 'transparent',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light' 
        },
        legend: {
            labels: {
                colors: isDarkMode ? '#f3f4f6' : '#374151'
            }
        },
        xaxis: {
            labels: {
                style: {
                    colors: isDarkMode ? '#f3f4f6' : '#374151'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: isDarkMode ? '#f3f4f6' : '#374151'
                }
            }
        },
        colors: chartColors,
        grid: {
            borderColor: 'rgba(156, 163, 175, 0.2)'
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => Math.round(val).toString(),
            style: {
                colors: ['#fff'],
                fontSize: '12px',
                fontWeight: 600,
                textOutline: '1px rgba(0,0,0,0.5)'
            },
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 1,
                color: '#000',
                opacity: 0.45
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val: number) => Math.round(val).toString()
            }
        }
    });

    // Top 10 Articles Chart
    const pieOptions = $derived({
        ...commonOptions,
        colors: pieColors,
        fill: {
            opacity: 1
        },
        chart: {
            ...commonOptions.chart,
            type: 'pie',
            height: '100%'
        },
        dataLabels: {
            ...commonOptions.dataLabels,
            formatter: (val: number) => Math.round(val).toString() + "%"
        },
        labels: data.articleStats.map(s => s.label),
        series: data.articleStats.map(s => s.value),
        legend: { position: 'bottom' },
        stroke: { show: false }
    });

    // Sales Count per Month
    const barCountOptions = $derived({
        ...commonOptions,
        chart: {
            ...commonOptions.chart,
            type: 'bar',
            height: '100%'
        },
        xaxis: {
            ...commonOptions.xaxis,
            categories: data.saleStats.map(s => s.label)
        },
        series: [
            { name: 'Verkäufe (Anzahl)', data: data.saleStats.map(s => s.count) }
        ],
        colors: ['#3273DC'],
        plotOptions: {
            bar: { borderRadius: 4, columnWidth: '60%' }
        },
        fill: {
            opacity: 1
        }
    });

    // Sales Volume per Month
    const barVolumeOptions = $derived({
        ...commonOptions,
        chart: {
            ...commonOptions.chart,
            type: 'bar',
            height: '100%'
        },
        xaxis: {
            ...commonOptions.xaxis,
            categories: data.saleStats.map(s => s.label)
        },
        yaxis: {
            ...commonOptions.yaxis,
            labels: {
                ...commonOptions.yaxis.labels,
                formatter: (val: number) => Math.round(val).toString() + " €"
            }
        },
        tooltip: {
            ...commonOptions.tooltip,
            y: {
                formatter: (val: number) => Math.round(val).toString() + " €"
            }
        },
        series: [
            { name: 'Umsatz (€)', data: data.saleStats.map(s => s.volume) }
        ],
        plotOptions: {
            bar: { borderRadius: 4, columnWidth: '60%' }
        },
        colors: ['#00BC7D'],
        fill: {
            opacity: 1
        }
    });

    // Revenue per Person Chart
    const barPersonOptions = $derived({
        ...commonOptions,
        chart: {
            ...commonOptions.chart,
            type: 'bar',
            height: '100%'
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                barHeight: '70%',
            }
        },
        xaxis: {
            ...commonOptions.xaxis,
            categories: data.personStats.map(s => s.label),
            labels: {
                ...commonOptions.xaxis.labels,
                formatter: (val: number) => Math.round(val).toString() + " €"
            }
        },
        yaxis: {
            ...commonOptions.yaxis
        },
        tooltip: {
            ...commonOptions.tooltip,
            y: {
                formatter: (val: number) => Math.round(val).toString() + " €"
            }
        },
        series: [
            { name: 'Umsatz (€)', data: data.personStats.map(s => s.value) }
        ],
        colors: ['#FFAA00'],
        fill: {
            opacity: 1
        }
    });

</script>

<div class="flex flex-col h-full overflow-hidden">
    <div class="px-3 mb-4">
        <FilterBar items={filterItems} selected={filter} parameterName="filter"></FilterBar>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-3 pb-4 overflow-y-auto">
        <Card className="flex flex-col h-[400px]">
            <CardTitleBig>Top 10 Artikel</CardTitleBig>
            <div class="flex-1 mt-2 min-h-0">
                {#if data.articleStats.length > 0}
                    {#if chartReady}
                        <div use:chartAction={() => pieOptions} class="h-full w-full"></div>
                    {:else}
                         <div class="flex items-center justify-center h-full text-muted-foreground animate-pulse">Lade Charts...</div>
                    {/if}
                {:else}
                    <div class="flex items-center justify-center h-full text-muted-foreground">Keine Daten verfügbar</div>
                {/if}
            </div>
        </Card>

        <Card className="flex flex-col h-[400px]">
            <CardTitleBig>Verkäufe pro Monat</CardTitleBig>
            <div class="flex-1 mt-2 min-h-0">
                {#if chartReady}
                    <div use:chartAction={() => barCountOptions} class="h-full w-full"></div>
                {:else}
                    <div class="flex items-center justify-center h-full text-muted-foreground animate-pulse">Lade Charts...</div>
                {/if}
            </div>
        </Card>

        <Card className="flex flex-col h-[400px]">
            <CardTitleBig>Umsatz pro Monat</CardTitleBig>
            <div class="flex-1 mt-2 min-h-0">
                {#if chartReady}
                    <div use:chartAction={() => barVolumeOptions} class="h-full w-full"></div>
                {:else}
                    <div class="flex items-center justify-center h-full text-muted-foreground animate-pulse">Lade Charts...</div>
                {/if}
            </div>
        </Card>

        <Card className="flex flex-col h-[500px] md:col-span-2">
            <CardTitleBig>Umsatz pro Person (Top 15)</CardTitleBig>
            <div class="flex-1 mt-2 min-h-0">
                {#if data.personStats.length > 0}
                    {#if chartReady}
                        <div use:chartAction={() => barPersonOptions} class="h-full w-full"></div>
                    {:else}
                        <div class="flex items-center justify-center h-full text-muted-foreground animate-pulse">Lade Charts...</div>
                    {/if}
                {:else}
                    <div class="flex items-center justify-center h-full text-muted-foreground">Keine Daten verfügbar</div>
                {/if}
            </div>
        </Card>
    </div>
</div>