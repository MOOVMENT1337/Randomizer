<script setup lang="ts">
defineProps<{ compact?: boolean }>()
</script>

<template>
  <RouterLink to="/" class="brand" aria-label="Randomizer — на главную">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M8 8h6l10 16h-6L8 8Z" fill="currentColor" />
        <path d="M18 8h6l-4 6.4-3-4.8L18 8ZM8 24l5.9-9.4 3 4.8L14 24H8Z" fill="currentColor" opacity=".58" />
      </svg>
    </span>
    <span v-if="!compact" class="brand-name">Randomizer</span>
  </RouterLink>
</template>
