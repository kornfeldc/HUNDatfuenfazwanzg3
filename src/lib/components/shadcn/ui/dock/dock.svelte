<script lang="ts">
	import { cn } from '$lib/utils';
	import { setDockContext } from './ctx';
	import { useMotionValue } from 'svelte-motion';
	import type { Snippet } from 'svelte';

	let {
		class: className,
 	magnification = 52,
		distance = 140,
		children
	}: {
		class?: string;
		magnification?: number;
		distance?: number;
		children: Snippet;
	} = $props();

	let mouseX = useMotionValue(Infinity);

	setDockContext({
		mouseX,
		magnification,
		distance
	});

	const handleMouseMove = (e: MouseEvent) => {
		mouseX.set(e.pageX);
	};

	const handleMouseLeave = () => {
		mouseX.set(Infinity);
	};
</script>

<div
	class={cn(
 	'mx-auto flex h-[50px] w-max items-center gap-2 rounded-2xl border bg-white px-2 dark:bg-black',
		className
	)}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
>
	{@render children()}
</div>
