<script lang="ts">
	import { cn } from '$lib/utils';
	import { getDockContext } from './ctx';
	import { Motion, useSpring, useTransform } from 'svelte-motion';
	import type { Snippet } from 'svelte';

	let {
		class: className,
		children,
		onclick,
		transparent = false,
		baseWidth = 34
	}: {
		class?: string;
		children: Snippet;
		onclick?: () => void;
		transparent?: boolean;
		baseWidth?: number;
	} = $props();

	let ref: HTMLElement | undefined = $state();
	const ctx = getDockContext();
	const mouseX = ctx.mouseX;

	let distanceCalc = useTransform(mouseX, (val: number) => {
		const bounds = ref?.getBoundingClientRect() ?? { x: 0, width: 0 };
		return val - bounds.x - bounds.width / 2;
	});

	let widthSync = $derived(useTransform(
		distanceCalc,
		[-ctx.distance, 0, ctx.distance],
		[baseWidth, ctx.magnification, baseWidth]
	));

	let width = $derived(useSpring(widthSync, {
		mass: 0.2,
		stiffness: 150,
		damping: 12
	}));
</script>

<Motion style={{ width, height: width }} let:motion>
	<button
		use:motion
		bind:this={ref}
		{onclick}
		class={cn(
			'flex aspect-square cursor-pointer items-center justify-center rounded-full transition-colors',
			!transparent && 'hover:bg-gray-100 dark:hover:bg-neutral-800',
			className
		)}
	>
		{@render children()}
	</button>
</Motion>
