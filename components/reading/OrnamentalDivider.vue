<template>
  <svg
    class="ornamental-divider"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 220 24"
    width="220"
    height="24"
    aria-hidden="true"
  >
    <!-- Left line -->
    <line x1="0" y1="12" x2="70" y2="12" stroke="currentColor" stroke-width="0.5" opacity="0.35" />

    <!-- Left small circle -->
    <circle cx="74" cy="12" r="1.5" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4" />

    <!-- Left curve pair -->
    <path d="M80,12 Q95,4 110,12" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.35" />
    <path d="M80,12 Q95,20 110,12" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.35" />

    <!-- Center diamond -->
    <rect x="105.5" y="7.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.45" transform="rotate(45 110 12)" />
    <!-- Center dot -->
    <circle cx="110" cy="12" r="1.2" fill="currentColor" opacity="0.4" />

    <!-- Right curve pair -->
    <path d="M110,12 Q125,4 140,12" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.35" />
    <path d="M110,12 Q125,20 140,12" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.35" />

    <!-- Right small circle -->
    <circle cx="146" cy="12" r="1.5" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4" />

    <!-- Right line -->
    <line x1="150" y1="12" x2="220" y2="12" stroke="currentColor" stroke-width="0.5" opacity="0.35" />
  </svg>
</template>

<style scoped>
.ornamental-divider {
  color: var(--gold-dim, #a08040);
  display: block;
}
</style>
