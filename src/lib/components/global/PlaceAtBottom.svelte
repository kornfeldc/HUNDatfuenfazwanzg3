<script lang="ts">
    import {Util} from "$lib/util";
    import {onDestroy, onMount} from "svelte";

    let {children, at = 'left'} = $props();

    // --- Page scroll lock (ref-counted) when the virtual keyboard is active or an input inside is focused ---
    let scrollYBefore = 0;
    let locallyLocked = false; // whether THIS component currently holds a lock

    const lockScroll = () => {
        if (typeof window === 'undefined') return;
        // @ts-ignore - share across HMR/instances by attaching to window
        if (window.__placeAtBottomLocks == null) window.__placeAtBottomLocks = 0;
        // @ts-ignore
        if (!locallyLocked) {
            // @ts-ignore
            const newCount = ++window.__placeAtBottomLocks;
            locallyLocked = true;
            if (newCount === 1) {
                scrollYBefore = window.scrollY || window.pageYOffset || 0;
                const body = document.body;
                body.style.position = 'fixed';
                body.style.top = `-${scrollYBefore}px`;
                body.style.left = '0';
                body.style.right = '0';
                body.style.width = '100%';
                body.style.overscrollBehavior = 'contain';
            }
        }
    };

    const unlockScroll = () => {
        if (typeof window === 'undefined') return;
        // @ts-ignore
        if (locallyLocked && window.__placeAtBottomLocks) {
            // @ts-ignore
            const newCount = --window.__placeAtBottomLocks;
            locallyLocked = false;
            if (newCount === 0) {
                const body = document.body;
                body.style.position = '';
                body.style.top = '';
                body.style.left = '';
                body.style.right = '';
                body.style.width = '';
                body.style.overscrollBehavior = '';
                window.scrollTo(0, scrollYBefore);
            }
        }
    };

    const isDesktopLike = () =>
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Dynamic bottom offset so the bar sits above the on-screen keyboard on mobile.
    let bottomPx = 10;
    let vv: VisualViewport | undefined;

    // State for deciding when to lock
    let focusWithin = false;
    let occludedPx = 0;

    const updateBottomAndLock = () => {
        try {
            if (vv) {
                // Amount of the layout viewport that is occluded at the bottom.
                // See https://developer.mozilla.org/docs/Web/API/Visual_Viewport_API
                occludedPx = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
                bottomPx = Math.round(occludedPx);
            } else {
                // No VisualViewport: keep bottom at 0; rely on focus heuristic
                bottomPx = 0;
                occludedPx = 0;
            }
        } catch {
            bottomPx = 0;
            occludedPx = 0;
        }
        ensureDesiredLock();
    };

    const ensureDesiredLock = () => {
        // Never lock on desktop-like environments
        if (isDesktopLike()) {
            if (locallyLocked) unlockScroll();
            return;
        }
        const shouldLock = focusWithin || occludedPx > 0;
        if (shouldLock) lockScroll(); else unlockScroll();
    };

    let resizeHandler: (() => void) | null = null;
    let scrollHandler: (() => void) | null = null;

    let container: HTMLDivElement | null = null;
    let focusInHandler: ((e: Event) => void) | null = null;
    let focusOutHandler: ((e: Event) => void) | null = null;

    onMount(() => {
        // Use visualViewport when available (mobile browsers)
        vv = typeof window !== 'undefined' && (window as any).visualViewport ? (window as any).visualViewport as VisualViewport : undefined;
        if (vv) {
            resizeHandler = () => updateBottomAndLock();
            scrollHandler = () => updateBottomAndLock();
            vv.addEventListener('resize', resizeHandler);
            vv.addEventListener('scroll', scrollHandler);
        }

        // Track focus within this bar (inputs, textareas, contenteditable)
        if (container) {
            focusInHandler = (e: Event) => {
                const target = e.target as HTMLElement | null;
                if (!target) return;
                const isEditable = target.closest('input, textarea, [contenteditable="true"]');
                if (isEditable) {
                    focusWithin = true;
                    ensureDesiredLock();
                }
            };
            focusOutHandler = (_e: Event) => {
                // Defer to allow focus to move within children before deciding
                setTimeout(() => {
                    if (!container) return;
                    const active = (document.activeElement as HTMLElement | null);
                    focusWithin = !!(active && container.contains(active) && active.matches('input, textarea, [contenteditable="true"]'));
                    ensureDesiredLock();
                }, 0);
            };
            container.addEventListener('focusin', focusInHandler);
            container.addEventListener('focusout', focusOutHandler);
        }

        // Initial compute
        updateBottomAndLock();
    });

    onDestroy(() => {
        if (vv) {
            if (resizeHandler) vv.removeEventListener('resize', resizeHandler);
            if (scrollHandler) vv.removeEventListener('scroll', scrollHandler);
        }
        if (container) {
            if (focusInHandler) container.removeEventListener('focusin', focusInHandler);
            if (focusOutHandler) container.removeEventListener('focusout', focusOutHandler);
        }
        // Ensure we release our lock if held
        if (locallyLocked) unlockScroll();
    });
</script>
<div bind:this={container} class={Util.mapClass("fixed p-3 flex gap-2", at === 'left', "left-0", "right-0")}
     style={`bottom: ${bottomPx}px; padding-bottom: env(safe-area-inset-bottom);`}>
    {@render children?.()}
</div>
