<script setup lang="ts">
import { CircleDotDashed, Hash, ListChecks } from 'lucide-vue-next'
import type { RandomizerType } from '@/types'
defineProps<{ type: RandomizerType; size?: number }>()
</script>

<template>
  <span class="type-icon" :class="`type-icon--${type}`" aria-hidden="true">
    <ListChecks v-if="type === 'list'" :size="size || 20" />
    <Hash v-else-if="type === 'range'" :size="size || 20" />
    <CircleDotDashed v-else :size="size || 20" />
  </span>
</template>
