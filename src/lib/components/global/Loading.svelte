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
    /* slow, subtle rotation */
    animation: rotate 6s linear infinite;
  }

  .dog-icon {
    /* gentle breathing/pulse */
    animation: pulse 1.8s ease-in-out infinite;
    filter: drop-shadow(0 4px 14px color-mix(in oklab, hsl(var(--primary)) 40%, transparent));
  }

  @keyframes rotate {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(0.96); opacity: 0.9; }
    50% { transform: scale(1.04); opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .icon-wrap, .dog-icon { animation: none; }
  }
</style>