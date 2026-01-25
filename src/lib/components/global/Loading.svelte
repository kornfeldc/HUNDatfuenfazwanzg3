<script lang="ts">
  import { Dog } from "@lucide/svelte";
  // Accessible label for screen readers only
  export let ariaLabel: string = "Loading";
</script>

<div class="absolute inset-0 z-50 bg-background/20 backdrop-blur-sm flex w-full h-full items-center justify-center">
  <div role="status" aria-live="polite" aria-label={ariaLabel} class="flex items-center justify-center">
    <div class="icon-wrap" aria-hidden="true">
      <Dog class="dog-icon text-primary/80" size={96} />
    </div>
    <span class="sr-only">{ariaLabel}</span>
  </div>
</div>

<style>
  .icon-wrap {
    display: inline-flex;
  }

  :global(.dog-icon) {
    /* cycling colors with a nice effect */
    animation: color-cycle 3s ease-in-out infinite;
    color: var(--primary);
    filter: drop-shadow(0 4px 14px color-mix(in oklab, var(--primary) 20%, transparent));
  }

  @keyframes color-cycle {
    0%,
    100% {
      color: var(--primary);
      stroke: var(--primary);
    }
    25% {
      color: #3b82f6;
      stroke: #3b82f6;
    } /* blue-500 */
    50% {
      color: #10b981;
      stroke: #10b981;
    } /* emerald-500 */
    75% {
      color: #f59e0b;
      stroke: #f59e0b;
    } /* amber-500 */
  }
</style>
